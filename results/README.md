# Resultados

Archivos generados por `proyecto_integrador.ipynb`. Todas las métricas de evaluación final son sobre
el holdout de 1.127 clientes (20 % estratificado, semilla 42).

| Archivo | Contenido |
|---|---|
| `eda_calidad.csv` | Chequeos de calidad de los datos |
| `eda_tasas.csv` | Tasa de bajas por categoría de las variables principales |
| `fig_eda.png` | Tasa de bajas por contrato, antigüedad, internet y medio de pago |
| `busqueda_hiperparametros.csv` | Mejores hiperparámetros de Random Forest y XGBoost |
| `cv_5folds.csv` | ROC AUC, PR-AUC y captura top 20 % en CV (media y desvío) |
| `desbalance.csv` | Regresión Logística con y sin ponderación de clases (CV) |
| `model_metrics.csv` | Métricas en el holdout, incluidos los benchmarks de negocio |
| `meta_ex_ante.csv` | Cumplimiento de la meta fijada en la pre-entrega |
| `lift_deciles.csv` | Bajas, tasa, captura acumulada y lift por decil de riesgo |
| `bootstrap_holdout.csv` | Intervalos bootstrap al 95 % y diferencias contra la Regresión Logística |
| `fig_pr_ganancia.png` | Curva Precision-Recall y curva de ganancia acumulada |
| `coeficientes.csv` | Coeficientes y odds ratios de la Regresión Logística |
| `fig_coeficientes.png` | Las 12 variables con mayor peso |
| `auditoria_grupos.csv` | Detección y precisión por grupo (edad, género, pareja, dependientes) |
| `ablaciones.csv` | Rendimiento al quitar variables sensibles o redundantes |
| `escenario_economico.csv` | Beneficio neto estimado por estrategia, costo y aceptación |
| `fig_escenarios.png` | Escenarios económicos con costo de contacto USD 15 |
| `predicciones_test.csv` | Probabilidad de baja y ranking de los 1.409 clientes de `test.csv` |
