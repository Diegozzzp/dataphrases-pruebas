from fastapi import FastAPI, UploadFile, HTTPException, Form, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import BytesIO
from datetime import datetime
import warnings
import asyncio

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

def process_dataframe(contents: bytes):
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

    return df, fecha_carga, columnas_asin

@app.post("/upload/")
async def upload_file(file: UploadFile):
    try:
        contents = await file.read()
        df, fecha_carga, columnas_asin = await asyncio.to_thread(process_dataframe, contents)

        # Actualizar el DataFrame principal
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

        # Eliminar columnas duplicadas
        global_data['df'] = global_data['df'].loc[:, ~global_data['df'].columns.duplicated()]

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
async def get_data(
    min_value: int = Query(1, alias="minValue"),
    max_value: int = Query(1000, alias="maxValue"),
    order_asin: bool = Query(False, alias="orderAsin"),
    order_search_volume: bool = Query(False, alias="orderSearchVolume")
):
    if global_data['df'] is None:
        raise HTTPException(status_code=404, detail="No hay datos cargados.")
    
    try:
        # Filtrar las columnas necesarias
        required_columns = ['Keyword Phrase', 'Keyword Sales', 'CPR']
        if global_data['current_asin_column']:
            asin_column = f"{global_data['current_asin_column']} ({datetime.now().strftime('%Y-%m-%d')})"
            # Verificar si la columna del ASIN existe
            if asin_column in global_data['df'].columns:
                required_columns.append(asin_column)
            else:
                raise HTTPException(status_code=400, detail=f"Columna {asin_column} no encontrada en los datos.")

        # Agregar la columna de Search Volume más reciente
        search_volume_columns = [col for col in global_data['df'].columns if col.startswith('Search Volume')]
        if search_volume_columns:
            required_columns.append(sorted(search_volume_columns)[-1])

        filtered_df = global_data['df'][required_columns]

        # Aplicar el filtro de rango a la columna ASIN
        if global_data['current_asin_column']:
            asin_column = f"{global_data['current_asin_column']} ({datetime.now().strftime('%Y-%m-%d')})"
            filtered_df = filtered_df[(filtered_df[asin_column] >= min_value) & (filtered_df[asin_column] <= max_value)]

        # Ordenar por la columna ASIN si se solicita
        if order_asin and global_data['current_asin_column']:
            asin_column = f"{global_data['current_asin_column']} ({datetime.now().strftime('%Y-%m-%d')})"
            filtered_df = filtered_df.sort_values(by=asin_column, ascending=False)

        # Ordenar por Search Volume si se solicita
        if order_search_volume and search_volume_columns:
            search_volume_column = sorted(search_volume_columns)[-1]
            filtered_df = filtered_df.sort_values(by=search_volume_column, ascending=False)

        return filtered_df.to_dict(orient='records')
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Error al filtrar las columnas: {e}")

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