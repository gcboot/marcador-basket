import pandas as pd

# Crear la tabla con datos y fórmulas para análisis vertical
data = {
    "Cuenta": [
        "Ventas",
        "(-) Costo de Ventas",
        "(=) Utilidad Bruta",
        "(-) Gastos de Venta",
        "(-) Gastos de Admon.",
        "(=) Utilidad de Operación",
        "(-) Otros Gastos",
        "(=) Utilidad Neta"
    ],
    "Monto (Q)": [
        2700690,
        1038500,
        1662190,
        485500,
        760850,
        415840,
        230600,
        185240
    ]
}

df = pd.DataFrame(data)

# Ruta de salida
out_path = "/mnt/data/Ejercicio_Analisis_Vertical.xlsx"

with pd.ExcelWriter(out_path, engine="xlsxwriter") as writer:
    df.to_excel(writer, sheet_name="Analisis Vertical", index=False, startrow=1)
    workbook  = writer.book
    worksheet = writer.sheets["Analisis Vertical"]
    
    # Títulos
    worksheet.write(0,0,"Análisis Vertical - Estado de Resultados (Base Ventas = 100%)")
    
    # Insertar columna de % sobre ventas con fórmulas
    worksheet.write(1,2,"% sobre Ventas")
    for i in range(len(df)):
        row_excel = i+2  # porque los datos empiezan en la fila 2 (0-indexed con startrow=1)
        monto_cell = f"B{row_excel+1}"
        ventas_cell = "B3"  # Ventas está en fila 3 de Excel
        formula = f"={monto_cell}/${ventas_cell}*100"
        worksheet.write_formula(row_excel,2,formula)
    
    # Formato de porcentaje
    percent_fmt = workbook.add_format({'num_format': '0.00"%"'})
    worksheet.set_column(2,2,18,percent_fmt)
    worksheet.set_column(0,0,28)
    worksheet.set_column(1,1,16)

out_path
