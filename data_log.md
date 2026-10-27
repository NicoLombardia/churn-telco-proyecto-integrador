# Registro de decisiones (data log)

Registro de las decisiones tomadas durante el proyecto, en orden, con su motivo.

## Pre-entrega (21/09/2026)

- Problema: ordenar clientes por riesgo de baja para que Retención concentre los contactos.
- Datos: competencia de Kaggle de la cátedra (Telco Customer Churn). 5.634 clientes en train,
  1.409 sin etiqueta en test.
- Baseline: Regresión Logística, Naive Bayes y kNN con split 80/20 estratificado, semilla 42.
  Mejor ROC AUC: Regresión Logística 0,848.
- Meta ex ante: ROC AUC ≥ 0,85; detectar ≥ 70 % de las bajas con ≥ 50 % de avisos correctos.

## Devolución del tutor

- El modelo identifica riesgo, pero los datos no permiten demostrar ingreso retenido ni reducción
  del churn. Costos y efectividad de la oferta son supuestos.
- Mantener Recall y Precision; agregar PR-AUC.
- Mostrar cuántas bajas reales quedan en el 20 % de mayor riesgo.
- Comparar la Regresión Logística con un ensamble; no hace falta usar redes neuronales.

## Decisiones de la entrega final

1. **KPI en dos niveles.** El KPI del modelo es la captura de bajas en el top 20 % (medible). El
   ingreso retenido pasa a ser un KPI de negocio que solo se mide con un piloto con grupo de
   control. Los montos se presentan como escenarios con supuestos declarados.
2. **Regla de selección fijada antes del holdout.** Mayor PR-AUC medio en CV; si la ventaja sobre
   la Regresión Logística es menor que el desvío entre folds del líder, se elige la Regresión
   Logística.
3. **Corrección de `TotalCharges`.** Los 8 clientes con antigüedad 0 tenían `TotalCharges` =
   1397,475, exactamente la mediana: una imputación hecha por quien armó el dataset. Se reemplaza
   por 0. (La pre-entrega había notado que los blancos del original no aparecían; acá se confirma
   cómo se completaron.)
4. **Filas con atributos idénticos.** Hay 15, con IDs distintos. Se conservan porque son clientes
   distintos que comparten perfil.
5. **Variables nuevas.** `n_servicios`, `cargo_promedio`, `dif_cargo`. Resultado: no mejoran el
   modelo (ablación en el cuarto decimal). Se mantienen por transparencia y se reporta el resultado
   neutro.
6. **Sin reponderación de clases, después de probarla.** La pre-entrega dejó pendiente el desbalance.
   Se comparó la Regresión Logística con y sin `class_weight='balanced'` en CV: PR-AUC 0,658 vs 0,659
   y captura en el top 20 % prácticamente igual. Solo cambia el umbral 0,5 (recall 80 % con
   precisión 52 %), que no se usa porque el corte lo fija la capacidad de contacto.
7. **Búsqueda de hiperparámetros.** 25 combinaciones al azar por ensamble, CV 5 folds (semilla 42),
   optimizando PR-AUC. La comparación final usa otros 5 folds (semilla 7) para no reutilizar la
   misma partición.
8. **Sin redes neuronales.** Justificado por el TP del Módulo 8 (mejor red: ROC AUC medio 0,841 vs
   0,848 de la Regresión Logística) y por la devolución del tutor.
9. **Modelo elegido: Regresión Logística ampliada.** XGBoost lidera la CV por 0,009 de PR-AUC con
   desvío 0,028 (0,667 vs 0,659). Bootstrap en el holdout: la diferencia contra la Regresión Logística incluye el 0
   para ambos ensambles.
10. **Benchmarks de negocio.** Contacto al azar y regla actual (todos los mes a mes). Con capacidad
    del 20 %, la regla se modela como elegir mes a mes sin orden.
11. **Auditoría ética.** Se mide por grupo (edad, género, pareja, dependientes) cuántos entran al
    top 20 % y qué proporción de sus bajas se detecta. Se detecta menos a los hombres (45 % vs
    62 %) con tasas de baja similares; sacar `gender` no cambia el rendimiento, así que se
    recomienda excluirla del modelo productivo.
12. **Corte recomendado.** Depende de la capacidad de llamados. Con la capacidad actual (53 %) el
    modelo encuentra el 89 % de las bajas contra el 87 % de la regla: mejora chica. Con capacidad
    limitada la diferencia es grande (53 % contra 32 % con el 20 %). Se propone pilotear con el top 20 %.
13. **Escenarios económicos.** Valor en riesgo = 12 × cargo mensual real; costo de contacto 15 o
    30 USD; aceptación 10, 20 o 30 %. Se reporta la aceptación de equilibrio para mostrar que la
    conclusión no depende de que los supuestos sean exactos.

## Límites conocidos

- Datos sin fechas: no hay validación temporal ni forma de descartar variables posteriores a la baja.
- Probabilidades no calibradas: se usan para ordenar.
- Impacto económico no medido: requiere piloto A/B.
