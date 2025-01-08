from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import BytesIO
import asyncio
from datetime import datetime
import logging

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.DEBUG)

global_data = {
    "df": None,
    "asin_columns": [],
    "favoritos": set(),
    "current_asin_column": None,
    "campaigns_df": None
}

def process_dataframe(contents: bytes):
    df = pd.read_excel(BytesIO(contents), dtype=str)
    df['Keyword Phrase'] = df['Keyword Phrase'].str.strip().str.lower()
    fecha_carga = datetime.now().strftime('%Y-%m-%d')
    columnas_sin_historico = ['Competing Products', 'Keyword Sales']
    for columna in columnas_sin_historico:
        if columna in df.columns:
            df[columna] = pd.to_numeric(df[columna], errors='coerce').fillna(0).astype(int)
    if 'Search Volume' in df.columns:
        df[f"Search Volume ({fecha_carga})"] = pd.to_numeric(df['Search Volume'], errors='coerce').fillna(0).astype(int)
        df.drop(columns=['Search Volume'], inplace=True)
    columnas_asin = [col for col in df.columns if len(col) == 10 and col.isalnum()]
    for asin_col in columnas_asin:
        df[f"{asin_col} ({fecha_carga})"] = pd.to_numeric(df[asin_col], errors='coerce').fillna(0).astype(int)
        df.drop(columns=[asin_col], inplace=True)
    return df, fecha_carga, columnas_asin

@app.post("/upload/")
async def upload_file(file: UploadFile, file_type: str = Form(...)):
    try:
        contents = await file.read()
        if file_type not in ["data", "campaigns"]:
            raise HTTPException(status_code=400, detail="Tipo de archivo no válido")
        
        if file_type == "data":
            df, fecha_carga, columnas_asin = await asyncio.to_thread(process_dataframe, contents)
            if global_data['df'] is None:
                global_data['df'] = df
            else:
                columnas_merge = ['Keyword Phrase']
                columnas_merge.extend(['Competing Products', 'Keyword Sales'])
                columnas_merge.extend([f"Search Volume ({fecha_carga})"])
                columnas_merge.extend([f"{col} ({fecha_carga})" for col in columnas_asin])
                global_data['df'] = pd.merge(
                    global_data['df'],
                    df[columnas_merge],
                    on='Keyword Phrase',
                    how='outer'
                ).fillna(0)
            global_data['df'] = global_data['df'].loc[:, ~global_data['df'].columns.duplicated()]
            global_data['asin_columns'] = list(set(global_data['asin_columns'] + columnas_asin))
            return {"asin_columns": global_data['asin_columns']}
        elif file_type == "campaigns":
            global_data['campaigns_df'] = pd.read_excel(BytesIO(contents), dtype=str)
            return {"message": "Campañas cargadas exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar el archivo: {str(e)}")

@app.get("/data/")
async def get_data(asin: str = None, minValue: int = None, maxValue: int = None, orderAsin: str = "", orderSearchVolume: str = ""):
    if global_data['df'] is None:
        raise HTTPException(status_code=404, detail="No hay datos cargados.")
    try:
        df = global_data['df']
        logging.debug(f"DataFrame Columns: {df.columns}")

        if asin:
            asin_column = [col for col in df.columns if col.startswith(asin)]
            if asin_column:
                asin_column = asin_column[0]
                volume_columns = [col for col in df.columns if 'Search Volume' in col]
                if volume_columns:
                    search_volume_column = volume_columns[0]
                else:
                    search_volume_column = 'Search Volume'
                df = df[['Keyword Phrase', search_volume_column, asin_column, 'CPR', 'Keyword Sales']]
                logging.debug(f"Filtered DataFrame Columns: {df.columns}")
                df = df[(df[asin_column] != 0) & (df[asin_column] != -1)]

        return df.fillna('').to_dict(orient='records')
    except Exception as e:
        logging.error(f"Error al obtener los datos: {e}")
        raise HTTPException(status_code=500, detail=f"Error al obtener los datos: {e}")

@app.get("/campaigns/")
async def get_campaigns(keyword_phrase: str):
    if global_data['campaigns_df'] is None:
        raise HTTPException(status_code=404, detail="No hay datos de campañas cargados.")
    try:
        campaigns_filtered = global_data['campaigns_df'][global_data['campaigns_df']['Customer Search Term'].str.lower() == keyword_phrase.lower()]
        campaigns_filtered = campaigns_filtered.fillna('')
        return campaigns_filtered.to_dict(orient='records')
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Error al filtrar las campañas: {e}")



@app.get("/campaign_data/")
async def get_campaign_data(keyword_phrase: str):
    if global_data['campaign_df'] is None:
        raise HTTPException(status_code=404, detail="No hay datos de campañas cargados.")
    
    try:
        df = global_data['campaign_df']
        filtered_df = df[df['Keyword Phrase'].str.lower() == keyword_phrase.lower()]
        return filtered_df.to_dict(orient='records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener los datos de campañas: {e}")

@app.post("/favoritos/")
async def manage_favoritos(asin: str):
    if asin in global_data['favoritos']:
        global_data['favoritos'].remove(asin)
    else:
        global_data['favoritos'].add(asin)
    return {"favoritos": list(global_data['favoritos'])}

@app.post("/set_asin/")
async def set_asin(asin: str = Form(...)):
    global_data['current_asin_column'] = asin
    return {"current_asin_column": global_data['current_asin_column']}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)