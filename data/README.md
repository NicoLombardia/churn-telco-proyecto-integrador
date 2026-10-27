# Datos

Este repositorio no incluye los CSV. Para ejecutar el notebook, descargarlos y ubicarlos en esta carpeta:

```
data/
├── train.csv   # 5.634 clientes, 21 columnas (incluye Churn)
└── test.csv    # 1.409 clientes, 20 columnas (sin Churn)
```

**Fuente:** competencia de Kaggle *Predicción de fuga de cliente*, provista por la cátedra del
Diplomado en Ciencia de Datos y Análisis Avanzado (UTN.BA).
https://www.kaggle.com/competitions/prediccion-de-fuga-de-cliente/data

Derivada del dataset público **Telco Customer Churn** de IBM. Los datos están anonimizados y no
contienen información de contacto.

**Nota de calidad:** en esta versión, los clientes con `tenure = 0` tienen `TotalCharges` completado
con la mediana de la columna (1397,475). El notebook lo corrige a 0 (ver `data_log.md`).
