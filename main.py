from fastapi import FastAPI, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import BytesIO
from datetime import datetime
import warnings

warnings.simplefilter("ignore", category=UserWarning)

app = FastAPI()

# Permitir peticiones CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Variable global para almacenar los datos
global_data = {
    "df": None,
    "asin_columns": [],
    "favoritos": set(),
    "current_asin_column": None
}

@app.post("/upload/")
async def upload_file(file: UploadFile):
    try:
        # Leer el archivo Excel
        contents = await file.read()
        df = pd.read_excel(BytesIO(contents), dtype=str)

        # Normalizar las frases clave
        df['Keyword Phrase'] = df['Keyword Phrase'].str.strip().str.lower()

        # Obtener fecha actual para el histórico
        fecha_carga = datetime.now().strftime('%Y-%m-%d')

        # Convertir columnas sin histórico
        columnas_sin_historico = ['Competing Products', 'Keyword Sales']
        for columna in columnas_sin_historico:
            if columna in df.columns:
                df[columna] = pd.to_numeric(df[columna], errors='coerce').fillna(0).astype(int)

        # Procesar Search Volume con histórico
        if 'Search Volume' in df.columns:
            df[f"Search Volume ({fecha_carga})"] = pd.to_numeric(df['Search Volume'], errors='coerce').fillna(0).astype(int)
            df.drop(columns=['Search Volume'], inplace=True)

        # Detectar y procesar columnas ASIN
        columnas_asin = [col for col in df.columns if len(col) == 10 and col.isalnum()]
        for asin_col in columnas_asin:
            df[f"{asin_col} ({fecha_carga})"] = pd.to_numeric(df[asin_col], errors='coerce').fillna(0).astype(int)
            df.drop(columns=[asin_col], inplace=True)

        # Actualizar el DataFrame principal
        if global_data['df'] is None:
            global_data['df'] = df
        else:
            columnas_merge = ['Keyword Phrase']
            columnas_merge.extend(columnas_sin_historico)
            columnas_merge.extend([f"Search Volume ({fecha_carga})"])
            columnas_merge.extend([f"{col} ({fecha_carga})" for col in columnas_asin])
            global_data['df'] = pd.merge(
                global_data['df'],
                df[columnas_merge],
                on='Keyword Phrase',
                how='outer'
            ).fillna(0)
            for columna in columnas_sin_historico:
                if columna in df.columns:
                    global_data['df'][columna] = df[columna]

        # Actualizar columnas ASIN únicas
        asins_unicos = set()
        for col in global_data['df'].columns:
            if '(' in col and len(col.split(' (')[0]) == 10 and col.split(' (')[0].isalnum():
                asins_unicos.add(col.split(' (')[0])
        global_data['asin_columns'] = sorted(list(asins_unicos))

        return {"message": "Archivo cargado y procesado exitosamente.", "asin_columns": global_data['asin_columns']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cargar el archivo: {e}")

@app.get("/data/")
async def get_data():
    if global_data['df'] is None:
        raise HTTPException(status_code=404, detail="No hay datos cargados.")
    
    # Filtrar las columnas necesarias
    if global_data['current_asin_column']:
        required_columns = ['Keyword Phrase', f"Search Volume ({datetime.now().strftime('%Y-%m-%d')})", global_data['current_asin_column'], 'Keyword Sales', 'CPR']
    else:
        required_columns = ['Keyword Phrase', f"Search Volume ({datetime.now().strftime('%Y-%m-%d')})", 'Keyword Sales', 'CPR']
    
    filtered_df = global_data['df'][required_columns]
    return filtered_df.to_dict(orient='records')

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