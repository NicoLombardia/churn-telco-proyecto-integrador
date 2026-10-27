# Proyecto Final Integrador — Predicción de abandono de clientes en telecomunicaciones

> Diplomado en Ciencia de Datos y Análisis Avanzado (UTN.BA) · Nicolás Alejo Lombardia · 2026

Uno de cada cuatro clientes se da de baja y hoy Retención llama a todos los que pagan mes a mes
(más de la mitad de la base). El proyecto construye un ranking de clientes según su riesgo de
baja para que la misma capacidad de contacto encuentre más bajas.

[Abrir el notebook en Google Colab](https://colab.research.google.com/github/NicoLombardia/churn-telco-proyecto-integrador/blob/main/proyecto_integrador.ipynb)

## Resultado principal

Todos los números salen de `proyecto_integrador.ipynb` y se guardan en `results/`.
Evaluación sobre el holdout de 1.127 clientes (299 bajas):

| Métrica | Contacto al azar | Regla actual (mes a mes) | Regresión Logística |
|---|---:|---:|---:|
| Captura de bajas contactando al 20 % | 20,0 % | 32,4 % * | **53,2 %** |
| Precisión en ese 20 % | 26,5 % | 43,0 % | **70,4 %** |
| PR-AUC (piso = tasa de bajas) | 0,265 | — | **0,667** |
| ROC AUC | 0,500 | — | **0,848** |

\* Con capacidad del 20 %, la regla actual solo puede elegir clientes mes a mes sin orden.

Para capturar el 87 % de las bajas que hoy encuentra la regla actual, el modelo necesita contactar
al 50 % de la base en lugar del 53 %. Con la misma capacidad que la regla actual (53 %), el modelo
encuentra el 89 % de las bajas: la mejora es chica. El valor aparece cuando la capacidad es limitada.

## Cómo se eligió el modelo

Regresión Logística, Random Forest y XGBoost quedan empatados: en validación cruzada XGBoost
lidera con PR-AUC 0,667 contra 0,659, una ventaja tres veces menor que el desvío entre folds
(0,028). La regla fijada **antes de mirar el holdout** elige entonces la Regresión Logística, más
simple e interpretable. En el holdout los intervalos bootstrap de la diferencia incluyen el cero.

No se usan redes neuronales: en el TP del Módulo 8, sobre este mismo split, la mejor red promedió
ROC AUC 0,841 contra 0,848 de la Regresión Logística.

## Lo que el proyecto no demuestra

Cuánto ingreso se conserva o cuánto baja el churn después de contactar. Eso requiere una campaña
con grupo de control. La sección 8 del notebook calcula escenarios con supuestos explícitos
(costo de contacto, tasa de aceptación), no ahorros medidos.

**Recomendación:** usar el ranking cuando la capacidad de contacto sea limitada, excluir `gender`
del modelo productivo y validar el impacto con un piloto A/B antes de adoptarlo.

## Estructura del repositorio

```
.
├── README.md
├── proyecto_integrador.ipynb      # notebook ejecutado de punta a punta
├── requirements.txt
├── data_log.md                    # registro de decisiones y límites
├── .gitignore
├── data/
│   └── README.md                  # fuente y cómo obtener los CSV
├── results/
│   ├── README.md                  # qué contiene cada archivo
│   ├── *.csv                      # tablas usadas en el informe
│   └── fig_*.png                  # figuras usadas en el informe
└── docs/
    ├── Pre-entrega_Proyecto_Final_Integrador.pdf
    ├── Informe_Final_Proyecto_Integrador.pdf / .docx
    └── build_informe.js           # genera el .docx a partir de results/
```

## Flujo metodológico (CRISP-DM)

| Sección | Contenido | Salidas |
|---|---|---|
| 1. Negocio | KPI medible vs KPI de negocio, meta y regla de selección ex ante | — |
| 2. Datos | calidad, imputación detectada en `TotalCharges`, exploratorio | `eda_calidad.csv`, `eda_tasas.csv`, `fig_eda.png` |
| 3. Preparación | corrección de calidad, variables derivadas, pipelines | — |
| 4. Modelado | búsqueda de hiperparámetros, CV 5 folds con folds distintos y prueba de ponderación de clases | `busqueda_hiperparametros.csv`, `cv_5folds.csv`, `desbalance.csv` |
| 5. Evaluación | holdout, benchmarks de negocio, lift, bootstrap | `model_metrics.csv`, `meta_ex_ante.csv`, `lift_deciles.csv`, `bootstrap_holdout.csv`, `fig_pr_ganancia.png` |
| 6. Interpretación | coeficientes de la Regresión Logística | `coeficientes.csv`, `fig_coeficientes.png` |
| 7. Ética | auditoría por grupos y ablaciones | `auditoria_grupos.csv`, `ablaciones.csv` |
| 8. Negocio | escenarios económicos paramétricos | `escenario_economico.csv`, `fig_escenarios.png` |
| 9. Scoring | ranking del archivo de prueba | `predicciones_test.csv` |

## Cómo ejecutar

### Google Colab
1. Abrir el notebook con el enlace de arriba.
2. Ejecutar **Entorno de ejecución → Ejecutar todas**.
3. Cuando la celda de carga lo pida, subir `train.csv` y `test.csv` (ver `data/README.md`).
   Colab ya trae `xgboost`; si faltara: `!pip install xgboost`.

### Local
```bash
git clone https://github.com/NicoLombardia/churn-telco-proyecto-integrador.git
cd churn-telco-proyecto-integrador
pip install -r requirements.txt
# copiar train.csv y test.csv en data/
jupyter nbconvert --to notebook --execute --inplace proyecto_integrador.ipynb
```

Corre en unos 4 minutos en una CPU común. La semilla es fija (42), así que los resultados son
reproducibles.

## Fuente de datos

Competencia de Kaggle [Predicción de fuga de cliente](https://www.kaggle.com/competitions/prediccion-de-fuga-de-cliente/data),
provista por la cátedra y derivada del dataset público Telco Customer Churn de IBM.
`train.csv`: 5.634 clientes, 20 variables + `Churn`. `test.csv`: 1.409 clientes sin etiqueta.

## Licencia

Código bajo licencia MIT. Los datos pertenecen a sus autores y se obtienen desde Kaggle.
