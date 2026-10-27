// Genera docs/Informe_Final_Proyecto_Integrador.docx a partir de las cifras de results/.
// Formato de la consigna: Arial, 12 pt cuerpo, 14-16 pt títulos, interlineado 1,5 en todo el
// documento, márgenes de 2 cm, máximo 12 páginas sin anexos. Todo el texto en negro.
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType,
  AlignmentType, HeadingLevel, BorderStyle, LevelFormat, PageBreak, Footer, PageNumber,
  ExternalHyperlink,
} = require('docx');

const RES = path.join(__dirname, '..', 'results');
const REPO = 'https://github.com/NicoLombardia/churn-telco-proyecto-integrador';
const COLAB = 'https://colab.research.google.com/github/NicoLombardia/churn-telco-proyecto-integrador/blob/main/proyecto_integrador.ipynb';
const KAGGLE = 'https://www.kaggle.com/competitions/prediccion-de-fuga-de-cliente/data';

const FONT = 'Arial';
const NEGRO = '000000';
const CM = 567;                     // DXA por cm
const ANCHO = 11906 - 4 * CM;       // A4 menos márgenes de 2 cm
const L15 = { line: 360, lineRule: 'auto' };   // interlineado 1,5

// ---------- helpers ----------
const runs = (t, base = {}) => t.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(s =>
  s.startsWith('**') ? new TextRun({ text: s.slice(2, -2), bold: true, ...base }) : new TextRun({ text: s, ...base }));
const P = (t, o = {}) => new Paragraph({ children: runs(t), alignment: AlignmentType.JUSTIFIED, spacing: { after: 120, ...L15 }, ...o });
const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const B = t => new Paragraph({ numbering: { reference: 'vinetas', level: 0 }, children: runs(t), alignment: AlignmentType.JUSTIFIED, spacing: { after: 60, ...L15 } });
const CAP = t => new Paragraph({ children: [new TextRun({ text: t, italics: true, size: 20 })], alignment: AlignmentType.CENTER, spacing: { before: 60, after: 200, ...L15 } });
const BR = () => new Paragraph({ children: [new PageBreak()] });
const LINK = (url, texto, size) => new ExternalHyperlink({ link: url, children: [new TextRun({ text: texto || url, color: NEGRO, underline: {}, size })] });

function IMG(file, anchoCm) {
  const data = fs.readFileSync(path.join(RES, file));
  const w = data.readUInt32BE(16), h = data.readUInt32BE(20);
  const px = anchoCm / 2.54 * 96;
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 0, ...L15 },
    children: [new ImageRun({ type: 'png', data, transformation: { width: px, height: px * h / w } })] });
}

const borde = { style: BorderStyle.SINGLE, size: 4, color: NEGRO };
function TABLA(enc, filas, anchos, destacar = []) {
  const total = anchos.reduce((a, b) => a + b, 0);
  const cols = anchos.map(a => Math.round(a / total * ANCHO));
  cols[cols.length - 1] += ANCHO - cols.reduce((a, b) => a + b, 0);
  const n = filas.length;
  const celda = (txt, i, head, bold, ultima) => new TableCell({
    width: { size: cols[i], type: WidthType.DXA },
    borders: { top: borde, bottom: borde, left: borde, right: borde },
    margins: { top: 20, bottom: 20, left: 80, right: 80 },
    children: [new Paragraph({ alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER, spacing: L15, keepNext: !ultima, keepLines: true,
      children: [new TextRun({ text: String(txt), size: 20, bold: head || bold })] })],
  });
  return new Table({
    width: { size: ANCHO, type: WidthType.DXA }, columnWidths: cols,
    rows: [new TableRow({ tableHeader: true, children: enc.map((t, i) => celda(t, i, true)) }),
      ...filas.map((f, r) => new TableRow({ cantSplit: true, children: f.map((t, i) => celda(t, i, false, destacar.includes(r), r === n - 1)) }))],
  });
}

// ---------- portada ----------
const C = (t, size, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { ...L15, after: o.after || 0, before: o.before || 0 },
  children: [new TextRun({ text: t, size, bold: o.bold })] });
const portada = [
  C('Diplomado en Ciencia de Datos y Análisis Avanzado', 28, { before: 1800 }),
  C('UTN.BA — Centro de e-Learning', 24, { after: 900 }),
  C('Predicción de abandono de clientes en una empresa de telecomunicaciones', 32, { bold: true, after: 240 }),
  C('Informe Final — Proyecto Final Integrador', 28, { after: 1400 }),
  C('Trabajo individual', 24),
  C('Integrante: Nicolás Alejo Lombardia', 24),
  C('26 de octubre de 2026', 24, { after: 1400 }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: L15, children: [new TextRun({ text: 'Código: ', size: 20 }), LINK(REPO, REPO, 20)] }),
  BR(),
];

// ---------- 1. resumen ----------
const resumen = [
  H1('1. Resumen ejecutivo'),
  P('Uno de cada cuatro clientes de la empresa se da de baja. Hoy el área de Retención llama a todos los que pagan mes a mes, que son más de la mitad de la base, y solo 43 de cada 100 de esos llamados llegan a alguien que efectivamente se iba. Construimos un modelo que estima, cliente por cliente, la probabilidad de que se vaya, para ordenar la cartera por riesgo y poner los llamados donde más rinden. Lo usarían Retención y la Dirección Comercial.'),
  P('Probamos tres algoritmos: Regresión Logística, Random Forest y XGBoost. Los tres rinden prácticamente igual, así que nos quedamos con la **Regresión Logística**, que es la más simple y la única que permite explicar por qué un cliente aparece como riesgoso.'),
  B('Si Retención llama solo al **20 % de clientes con mayor riesgo, encuentra el 53 % de todas las bajas**, y 70 de cada 100 llamados son a alguien que se iba. Es 2,7 veces más que llamar al azar y bastante más que elegir clientes mes a mes sin orden (32 %).'),
  B('Para encontrar el 87 % de las bajas, que es lo que logra hoy la regla actual, al modelo le alcanza con llamar al 50 % de la base en lugar del 53 %.'),
  B('En la prueba final el modelo ordena bien a los clientes: ROC AUC de 0,848 y PR-AUC de 0,667, cuando elegir al azar daría 0,265.'),
  P('Lo que estos datos no permiten demostrar es cuánta plata se conserva ni cuánto bajan las bajas después de llamar: para eso hace falta una campaña con un grupo de control. Los montos de la sección 6 son escenarios con supuestos declarados, no ahorros medidos. Recomendamos usar el modelo cuando la capacidad de llamados sea limitada y medir el impacto real con un piloto antes de adoptarlo.'),
  BR(),
];

// ---------- 2. problema ----------
const problema = [
  H1('2. Definición del problema y relevancia'),
  P('Conservar a un cliente sale más barato que conseguir uno nuevo, pero las campañas de retención suelen hacerse sobre toda la base o sobre segmentos muy amplios, y gran parte de los llamados va a gente que no pensaba irse. La pregunta que queremos responder es concreta: **con una cantidad de llamados dada, ¿cómo encontramos la mayor cantidad posible de clientes que están por irse?**'),
  H2('2.1 Objetivo e indicadores'),
  P('A partir de la devolución de la pre-entrega separamos lo que podemos medir de lo que no:'),
  B('Lo que mide el modelo con estos datos es qué parte de las bajas reales queda dentro del 20 % de clientes con mayor riesgo, y cuántos de esos llamados son acertados. Además reportamos recall, precisión, F1, PR-AUC y ROC AUC.'),
  B('Lo que le importa al negocio es cuánto ingreso se conserva y cuánto baja la tasa de bajas entre los clientes contactados, comparado con un grupo al que no se llama. Esto no se puede medir con estos datos: requiere un piloto.'),
  P('En la pre-entrega fijamos la meta: un ROC AUC de 0,85 o más, detectando al menos 7 de cada 10 bajas con la mitad o más de los avisos correctos. Antes de mirar la prueba final también fijamos cómo elegir el modelo: gana el de mayor PR-AUC promedio en validación cruzada, salvo que su ventaja sobre la Regresión Logística sea menor que lo que varía entre particiones. En ese caso elegimos la Regresión Logística, por simple y explicable.'),
  H2('2.2 Hipótesis y restricciones'),
  P('Sospechábamos que el tipo de contrato era el factor más fuerte, que el riesgo se concentraba en los primeros meses y que pesaban la factura alta, no tener soporte técnico y pagar con cheque electrónico. Trabajamos con tres limitaciones: los datos son una foto sin fechas, no tenemos los costos reales de la empresa y el archivo de prueba de la competencia no trae la respuesta, así que toda la evaluación sale de dividir el de entrenamiento.'),
];

// ---------- 3. datos ----------
const datos = [
  H1('3. Datos y metodología'),
  H2('3.1 Fuente y calidad'),
  P('Usamos el conjunto de la competencia de Kaggle «Predicción de fuga de cliente» que dio la cátedra, derivado del conjunto público Telco Customer Churn de IBM: 5.634 clientes con 21 columnas para entrenar y 1.409 sin respuesta para puntuar. Son datos anonimizados y de uso libre. El 26,5 % de los clientes de entrenamiento se dio de baja.'),
  TABLA(['Qué revisamos', 'Qué encontramos', 'Qué hicimos'], [
    ['Celdas vacías', 'Ninguna en los dos archivos', 'Nada'],
    ['Clientes en ambos archivos', 'Ninguno', 'Nada'],
    ['Filas con datos idénticos', '15, con distinto cliente', 'Las dejamos: son clientes distintos'],
    ['Antigüedad 0 y total pagado', 'Los 8 tienen 1.397,475, la mediana', 'Corregimos el total a 0'],
    ['Total pagado y antigüedad × cargo', 'Correlación de 0,999', 'Lo tomamos en cuenta al interpretar'],
  ], [3.2, 3, 3.2]),
  CAP('Tabla 1. Chequeos de calidad de los datos.'),
  P('El hallazgo más importante fue que, en los datos originales, los clientes recién llegados tienen el total pagado en blanco, y en esta versión alguien lo completó con la mediana de la columna. Así, un cliente con cero meses figuraba como si hubiera pagado casi dos años. Lo corregimos poniendo cero.'),
  H2('3.2 Conclusiones del análisis exploratorio'),
  IMG('fig_eda.png', 15.5),
  CAP('Figura 1. Tasa de bajas por segmento.'),
  P('Las tres hipótesis se confirmaron. Los clientes mes a mes son el 55 % de la base, se van en un 43 % y concentran el 89 % de las bajas; con contrato de dos años la tasa cae al 3 %. En los primeros seis meses se va más de la mitad. Los que tienen fibra óptica (42 %), pagan con cheque electrónico (46 %) o no tienen soporte técnico (42 %) superan con holgura el promedio de 26,5 %.'),
  H2('3.3 Preparación y metodología'),
  P('Seguimos CRISP-DM: el notebook tiene una sección por etapa, desde la comprensión del negocio hasta el puntaje final, y cada resultado queda guardado en el repositorio. Sacamos el identificador, pasamos la respuesta a 0 y 1, corregimos el total pagado de los clientes nuevos y armamos tres variables: cuántos servicios adicionales tiene el cliente, cuánto pagó en promedio por mes y cuánto difiere su cargo actual de ese promedio. Todo el preparado se calcula solo con los datos de entrenamiento de cada partición, para que la evaluación no vea nada de antemano.'),
  P('Mantuvimos la división de los trabajos anteriores: 80 % para entrenar y 20 % apartado para una única prueba final (1.127 clientes, 299 bajas), con la misma proporción de bajas en ambas partes. También probamos darle más peso a las bajas al entrenar, para compensar que son minoría. El orden de los clientes no cambió (PR-AUC de 0,658 contra 0,659); lo único que cambia es dónde cae el corte automático de 0,5, que nosotros no usamos porque el corte lo define la cantidad de llamados disponibles. Por eso seguimos sin ponderar.'),
];

// ---------- 4. modelado ----------
const modelado = [
  H1('4. Modelado y evaluación'),
  H2('4.1 Algoritmos probados y cómo los comparamos'),
  P('Comparamos cuatro versiones: la Regresión Logística de la pre-entrega como punto de partida, la misma con la corrección de datos y las variables nuevas («ampliada»), un Random Forest y un XGBoost. Para los dos últimos probamos 25 combinaciones de parámetros con validación cruzada: entrenamos en cuatro quintos de los datos, evaluamos en el quinto restante y rotamos cinco veces. Después volvimos a comparar todo con otra partición en cinco, para no evaluar en las mismas partes donde elegimos los parámetros.'),
  P('No sumamos redes neuronales. En el TP de Deep Learning (Módulo 8), sobre esta misma división, la mejor red promedió un ROC AUC de 0,841 en cinco corridas, por debajo del 0,848 de la Regresión Logística y con muchísimo más cómputo.'),
  TABLA(['Validación cruzada', 'ROC AUC', 'PR-AUC', 'Bajas en el top 20 %'], [
    ['Regresión Logística inicial', '0,845 ± 0,011', '0,660 ± 0,027', '50,4 % ± 0,8'],
    ['Regresión Logística ampliada', '0,845 ± 0,011', '0,659 ± 0,027', '50,6 % ± 0,9'],
    ['Random Forest', '0,845 ± 0,014', '0,666 ± 0,030', '49,7 % ± 2,2'],
    ['XGBoost', '0,847 ± 0,011', '0,667 ± 0,028', '51,1 % ± 1,1'],
  ], [3.4, 2, 2, 2.4]),
  CAP('Tabla 2. Promedio ± variación entre las cinco particiones del entrenamiento.'),
  P('Para leer las métricas: el ROC AUC es la probabilidad de que el modelo ponga a un cliente que se va por encima de uno que se queda. El PR-AUC resume qué tan alta se mantiene la precisión a medida que detectamos más bajas; elegir al azar daría 0,265.'),
  H2('4.2 Por qué elegimos la Regresión Logística'),
  P('XGBoost queda primero en la validación cruzada, pero su ventaja en PR-AUC (0,009) es tres veces más chica que lo que varía entre particiones (0,028). Por la regla fijada de antemano elegimos la **Regresión Logística ampliada**. La prueba final lo confirma: repitiendo la evaluación 1.000 veces sobre remuestreos de los clientes apartados, la diferencia contra la Regresión Logística va de −0,026 a +0,026 para Random Forest y de −0,019 a +0,029 para XGBoost. Es decir, no podemos afirmar que alguno sea mejor.'),
  P('Hay dos resultados neutros que preferimos contar: ni la corrección de datos ni las variables nuevas mejoraron el modelo, y los ensambles tampoco encontraron combinaciones de factores que la Regresión Logística no capture. Coincide con lo que vimos en el TP de Deep Learning: en estos datos, los factores de riesgo se suman de forma bastante independiente.'),
  H2('4.3 Resultados en la prueba final'),
  TABLA(['Prueba final (1.127 clientes)', 'ROC AUC', 'PR-AUC', 'Recall', 'Precisión', 'F1', 'Bajas en top 20 %', 'Precisión top 20 %'], [
    ['Regresión Logística ampliada', '0,848', '0,667', '54,8 %', '69,5 %', '0,613', '53,2 %', '70,4 %'],
    ['Random Forest', '0,849', '0,665', '43,5 %', '69,5 %', '0,535', '53,2 %', '70,4 %'],
    ['XGBoost', '0,851', '0,671', '48,8 %', '69,5 %', '0,574', '52,8 %', '69,9 %'],
    ['Regla actual (llamar a todos los mes a mes)', '—', '—', '86,6 %', '43,0 %', '0,575', '32,4 %*', '43,0 %'],
    ['Llamar al azar', '0,500', '0,265', '—', '—', '—', '20,0 %', '26,5 %'],
  ], [3.4, 1.2, 1.2, 1.3, 1.4, 1.1, 1.5, 1.6], [0]),
  CAP('Tabla 3. Recall, precisión y F1 de los modelos con el corte automático de 0,5; la regla actual llama al 53 % de la base. *Si solo pudiera llamar al 20 %, eligiendo mes a mes sin orden.'),
  IMG('fig_pr_ganancia.png', 16.5),
  CAP('Figura 2. Precisión según cuántas bajas se detectan (izquierda) y bajas encontradas según cuántos clientes se contactan (derecha).'),
  P('El gráfico de la derecha muestra el resultado que pidió la devolución. Si ordenamos a los clientes por riesgo, en el primer 10 % se va el 75 % y en el segundo el 66 %: entre los dos concentran el 53 % de todas las bajas. Del 30 % en adelante, cada tramo tiene una tasa de bajas por debajo del promedio, y en el 30 % de menor riesgo casi no hay bajas (7 de 339 clientes).'),
  P('Contra la meta de la pre-entrega, el ROC AUC quedó en 0,848, apenas debajo del 0,85 que nos habíamos puesto. Para detectar el 70 % de las bajas hay que llamar al 31,5 % de la base, y 59 de cada 100 de esos llamados son acertados: la meta de precisión se cumple y la de detección se alcanza con un corte algo más amplio que el 20 %.'),
  H2('4.4 Qué factores pesan'),
  P('Los coeficientes de la Regresión Logística ordenan los factores igual que el análisis exploratorio (ver Anexo B). Con contrato de dos años, las chances de irse son 0,23 veces las de un cliente mes a mes, y con contrato de un año, la mitad. También bajan el riesgo la antigüedad, la seguridad en línea y el soporte técnico. Lo suben la fibra óptica (más de tres veces), el pago con cheque electrónico y la factura electrónica (un tercio más cada uno). Esto le da a Retención argumentos concretos: ofrecer pasar a contrato anual, sumar soporte técnico o pasar a débito automático. Son asociaciones, no causas, y hay que probarlas en el piloto.'),
];

// ---------- 5. ética ----------
const etica = [
  H1('5. Consideraciones éticas y de privacidad'),
  P('Los datos son públicos, están anonimizados y no tienen información de contacto, así que su uso académico no presenta riesgos de privacidad. En un uso real, los datos de clientes deberían tratarse según la Ley 25.326 de Protección de Datos Personales, con acceso restringido a la lista de riesgo.'),
  P('Revisamos cómo trata el modelo a distintos grupos de clientes. El 39 % de los mayores de 65 años queda dentro del 20 % de mayor riesgo, contra el 16 % del resto, pero es porque se van casi el doble (42 % contra 23 %); los avisos son igual de acertados en los dos grupos (72 % y 70 %). Lo que más nos llamó la atención fue el género: con tasas de baja parecidas (28 % en hombres y 26 % en mujeres), el modelo encuentra el 45 % de las bajas de hombres y el 62 % de las de mujeres. Si sacamos el género, el modelo rinde exactamente igual (PR-AUC de 0,667 en ambos casos), así que **recomendamos no usarlo en el modelo productivo** y seguir de cerca la detección por grupo.'),
  P('La salvaguarda más importante es de uso: el modelo solo debe disparar ofertas de retención, nunca condiciones peores, recargos o menor calidad de servicio para quien aparece como riesgoso.'),
];

// ---------- 6. impacto ----------
const impacto = [
  H1('6. Impacto en el negocio'),
  H2('6.1 Escenarios económicos'),
  P('Con estos datos no podemos medir cuánto ingreso se conserva. Lo que sí podemos hacer es calcular escenarios con supuestos a la vista sobre los 1.127 clientes de la prueba final: perder un cliente cuesta doce meses de su cargo mensual real, cada llamado cuesta USD 15 y acepta la oferta entre el 10 % y el 30 % de los que se iban.'),
  TABLA(['Estrategia', 'Llamados', 'Bajas halladas', 'Acepta 10 %', 'Acepta 20 %', 'Acepta 30 %', 'Aceptación mínima'], [
    ['Modelo, top 10 %', '113', '85', 'USD 7.065', 'USD 15.825', 'USD 24.584', '1,9 %'],
    ['Modelo, top 20 %', '226', '159', 'USD 12.586', 'USD 28.563', 'USD 44.539', '2,1 %'],
    ['Modelo, top 30 %', '339', '206', 'USD 14.846', 'USD 34.777', 'USD 54.708', '2,6 %'],
    ['Regla actual (mes a mes)', '602', '259', 'USD 14.421', 'USD 37.871', 'USD 61.322', '3,8 %'],
  ], [2.7, 1.6, 1.6, 1.7, 1.7, 1.7, 1.8], [1]),
  CAP('Tabla 4. Beneficio neto estimado según qué porcentaje acepta la oferta, con USD 15 por llamado. La última columna es la aceptación que hace falta para cubrir el costo.'),
  P('La conclusión no depende de que los supuestos sean exactos: llamando al top 20 %, alcanza con que acepte la oferta alrededor del 2 % de los clientes que se iban para cubrir el costo, y aun con USD 30 por llamado el umbral sube apenas al 4 %. Como perder un cliente cuesta unas cincuenta veces más que llamarlo, si los llamados fueran ilimitados convendría llamar a mucha gente, y la regla actual no estaría mal.'),
  P('**El modelo agrega valor cuando la capacidad es limitada.** Con 226 llamados encuentra 159 bajas, contra unas 97 eligiendo mes a mes sin orden. Si en cambio se mantiene la capacidad actual (el 53 % de la base), la mejora es chica: el modelo encuentra el 89 % de las bajas contra el 87 % de la regla, unas 7 bajas más cada 1.127 clientes. Por eso proponemos fijar el corte según los llamados disponibles, y empezar el piloto con el top 20 %.'),
  H2('6.2 Riesgos y limitaciones'),
  B('Como los datos no tienen fechas, no pudimos probar el modelo contra meses posteriores ni descartar que alguna columna refleje algo ocurrido después de la baja.'),
  B('Los montos son escenarios: el impacto real solo se conoce con un piloto que compare clientes llamados contra un grupo al que no se llama.'),
  B('La probabilidad que da el modelo sirve para ordenar; no verificamos que sea exacta, así que un 0,6 no debe leerse como un 60 % preciso.'),
  B('Los datos son públicos y de otro mercado: antes de usarlo habría que reentrenarlo con datos propios de la empresa.'),
  H2('6.3 Escalabilidad y próximos pasos'),
  P('El modelo entrena en menos de un segundo y puntúa miles de clientes al instante, así que puede recalcularse todos los meses con la base actualizada. El notebook ya genera la lista ordenada de los 1.409 clientes del archivo de prueba. Los pasos que siguen son reentrenar con datos propios y con fecha, correr un piloto con grupo de control y el mismo presupuesto de llamados para medir cuánto se retiene, y seguir cada mes cuántas bajas caen en el top 20 % y cómo se reparten entre grupos.'),
];

// ---------- 7. conclusiones ----------
const conclusiones = [
  H1('7. Conclusiones y recomendaciones'),
  B('El proyecto es viable y el modelo cumple su función: el 20 % de clientes con mayor riesgo concentra el 53 % de las bajas, 2,7 veces más que al azar y bastante más que la regla actual con la misma cantidad de llamados.'),
  B('La Regresión Logística es la elección correcta para este problema: rinde igual que Random Forest y XGBoost, es más simple y puede explicar sus decisiones. Las redes neuronales no se justifican.'),
  B('El factor que más pesa es el contrato mes a mes, seguido de la poca antigüedad, la fibra óptica, el pago con cheque electrónico y la falta de soporte técnico.'),
  B('Recomendamos usar la lista ordenada por riesgo cuando haya que priorizar llamados, sacar el género del modelo, ofrecer contrato anual, soporte técnico y débito automático a los clientes de mayor riesgo, y medir el impacto con un piloto controlado antes de adoptarlo.'),
  H1('Fuentes'),
  new Paragraph({ spacing: { after: 120, ...L15 }, children: [new TextRun('Kaggle, «Predicción de fuga de cliente», competencia de la cátedra. '), LINK(KAGGLE)] }),
  P('IBM, Telco Customer Churn (conjunto de datos original).', { alignment: AlignmentType.LEFT }),
  P('James, G., Witten, D., Hastie, T. y Tibshirani, R. (2023). An Introduction to Statistical Learning with Applications in Python. Springer.', { alignment: AlignmentType.LEFT }),
  P('Lombardia, N. A. (2026). TP Deep Learning, Módulo 8. Diplomado en Ciencia de Datos y Análisis Avanzado, UTN.BA.', { alignment: AlignmentType.LEFT }),
  new Paragraph({ spacing: { after: 120, ...L15 }, children: [new TextRun('Código y resultados: '), LINK(REPO)] }),
  new Paragraph({ spacing: { after: 120, ...L15 }, children: [new TextRun('Notebook en Google Colab: '), LINK(COLAB, 'abrir proyecto_integrador.ipynb')] }),
];

// ---------- anexos ----------
const anexos = [
  BR(),
  H1('Anexo A. Escenarios económicos'),
  IMG('fig_escenarios.png', 14),
  CAP('Figura A1. Beneficio neto estimado según qué parte de la base se llama. Los rombos blancos son la regla actual.'),
  H1('Anexo B. Factores que pesan en el modelo'),
  IMG('fig_coeficientes.png', 13),
  CAP('Figura B1. Las 12 variables con más peso en la Regresión Logística ampliada.'),
  H1('Anexo C. Revisión por grupos'),
  TABLA(['Grupo', 'Clientes', 'Tasa de baja', 'En el top 20 %', 'Bajas detectadas', 'Avisos acertados'], [
    ['Menores de 65', '936', '23,4 %', '16,2 %', '48,4 %', '69,7 %'],
    ['Mayores de 65', '191', '41,9 %', '38,7 %', '66,2 %', '71,6 %'],
    ['Mujeres', '565', '25,5 %', '22,8 %', '61,8 %', '69,0 %'],
    ['Hombres', '562', '27,6 %', '17,3 %', '45,2 %', '72,2 %'],
    ['Sin pareja', '574', '31,4 %', '26,5 %', '58,3 %', '69,1 %'],
    ['Con pareja', '553', '21,5 %', '13,4 %', '45,4 %', '73,0 %'],
    ['Sin hijos a cargo', '799', '30,2 %', '24,9 %', '58,1 %', '70,4 %'],
    ['Con hijos a cargo', '328', '17,7 %', '8,2 %', '32,8 %', '70,4 %'],
  ], [2.6, 1.3, 1.4, 1.5, 1.7, 1.7]),
  CAP('Tabla C1. Comportamiento del modelo por grupo en la prueba final.'),
  TABLA(['Variables que sacamos', 'ROC AUC', 'PR-AUC', 'Bajas en top 20 %'], [
    ['Ninguna (modelo completo)', '0,848', '0,667', '53,2 %'],
    ['Género', '0,849', '0,667', '52,8 %'],
    ['Mayor de 65', '0,848', '0,665', '53,9 %'],
    ['Género y mayor de 65', '0,848', '0,665', '53,9 %'],
    ['Total pagado', '0,846', '0,665', '53,5 %'],
    ['Las tres variables nuevas', '0,848', '0,667', '53,2 %'],
  ], [3.6, 2, 2, 2.2]),
  CAP('Tabla C2. Rendimiento al sacar variables de a una.'),
  H1('Anexo D. Parámetros elegidos'),
  P('Random Forest: 800 árboles, profundidad máxima 8, al menos 20 clientes por hoja. XGBoost: 400 árboles de profundidad 2 y tasa de aprendizaje 0,03. Regresión Logística: regularización por defecto. El detalle de la búsqueda está en el repositorio.'),
];

const doc = new Document({
  creator: 'Nicolás Alejo Lombardia',
  title: 'Predicción de abandono de clientes — Informe Final',
  styles: {
    default: { document: { run: { font: FONT, size: 24, color: NEGRO }, paragraph: { spacing: L15 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: FONT, color: NEGRO }, paragraph: { spacing: { before: 240, after: 120, ...L15 }, outlineLevel: 0, keepNext: true } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: FONT, color: NEGRO }, paragraph: { spacing: { before: 180, after: 80, ...L15 }, outlineLevel: 1, keepNext: true } },
    ],
  },
  numbering: { config: [{ reference: 'vinetas', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 567, hanging: 283 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 2 * CM, bottom: 2 * CM, left: 2 * CM, right: 2 * CM } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 20 })] })] }) },
    children: [...portada, ...resumen, ...problema, ...datos, ...modelado, ...etica, ...impacto, ...conclusiones, ...anexos],
  }],
});

// La librería agrega estilos por defecto (títulos 3-6, hipervínculo, notas) con color azul e
// interlineado simple. No se usan, pero se pasan a negro y 1,5 para que todo el documento cumpla.
const JSZip = require(require.resolve('jszip', { paths: [path.dirname(require.resolve('docx'))] }));
Packer.toBuffer(doc).then(async b => {
  const zip = await JSZip.loadAsync(b);
  let st = await zip.file('word/styles.xml').async('string');
  st = st.replace(/w:color w:val="(?!000000)[0-9A-Fa-f]{6}"/g, 'w:color w:val="000000"')
         .replace(/w:themeColor="[^"]*"/g, '')
         .replace(/w:line="240"/g, 'w:line="360"');
  zip.file('word/styles.xml', st);
  const out = path.join(__dirname, 'Informe_Final_Proyecto_Integrador.docx');
  fs.writeFileSync(out, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  console.log('ok', out);
});
