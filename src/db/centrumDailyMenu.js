export const centrumAdultTargets = [
  { key: "vitaminA", name: "Vitamina A", amount: 400, unit: "µg" },
  { key: "vitaminB1", name: "Vitamina B1", amount: 1.2, unit: "mg" },
  { key: "vitaminB2", name: "Vitamina B2", amount: 1.3, unit: "mg" },
  { key: "vitaminB3", name: "Vitamina B3", amount: 16, unit: "mg" },
  { key: null, name: "Vitamina B5", amount: 5, unit: "mg" },
  { key: "vitaminB6", name: "Vitamina B6", amount: 1.3, unit: "mg" },
  { key: "folate", name: "Vitamina B9 (folato)", amount: 240, unit: "µg" },
  { key: "vitaminB12", name: "Vitamina B12", amount: 2.4, unit: "µg" },
  { key: "vitaminC", name: "Vitamina C", amount: 45, unit: "mg" },
  { key: "vitaminD", name: "Vitamina D", amount: 5, unit: "µg" },
  { key: "vitaminE", name: "Vitamina E", amount: 6.7, unit: "mg" },
  { key: null, name: "Vitamina K", amount: 65, unit: "µg" },
  { key: null, name: "Biotina", amount: 30, unit: "µg" },
];

export const centrumAdultMineralTargets = [
  { key: "calcium", name: "Cálcio", amount: 250, unit: "mg" },
  { key: "iron", name: "Ferro", amount: 8.1, unit: "mg" },
  { key: "magnesium", name: "Magnésio", amount: 100, unit: "mg" },
  { key: "zinc", name: "Zinco", amount: 7, unit: "mg" },
  { key: "copper", name: "Cobre", amount: 450, unit: "µg" },
  { key: null, name: "Cromo", amount: 18, unit: "µg" },
  { key: null, name: "Iodo", amount: 33, unit: "µg" },
  { key: "manganese", name: "Manganês", amount: 1.2, unit: "mg" },
  { key: null, name: "Molibdênio", amount: 25, unit: "µg" },
  { key: "selenium", name: "Selênio", amount: 20, unit: "µg" },
  { key: "phosphorus", name: "Fósforo", amount: 125, unit: "mg" },
  {
    key: "potassium",
    name: "Potássio",
    amount: 10,
    unit: "µg",
    notComparable: true,
  },
  { key: null, name: "Cloro", amount: 320, unit: "µg" },
];

export const centrumDailyMenu = [
  {
    meal: "Café da manhã",
    foods: [
      { key: "goiaba", portion: "1 goiaba média", grams: 100 },
      { key: "banana", portion: "1 banana pequena", grams: 100 },
    ],
  },
  {
    meal: "Almoço",
    foods: [
      { key: "espinafre", portion: "1 xícara de folhas cruas", grams: 30 },
      { key: "brocolis", portion: "1 xícara picado", grams: 90 },
      { key: "cenoura", portion: "1/2 cenoura média", grams: 50 },
      { key: "tomate", portion: "1 tomate médio", grams: 100 },
    ],
  },
  {
    meal: "Lanche",
    foods: [
      { key: "mamao-formosa", portion: "1 fatia de mamão Formosa", grams: 150 },
      { key: "abacate", portion: "1/4 de abacate médio", grams: 75 },
    ],
  },
];

export const centrumFormulaSource =
  "https://www.centrum.com.br/content/dam/cf-consumer-healthcare/bp-wellness-centrum/pt_BR/pdf/Tabela%20Nutricional%20Centrum%20de%20A%20a%20Zinco.pdf";

export const centrumMineralFormulaSource =
  "https://www.bulas.med.br/p/bulas-de-medicamentos/bula/4015/centrum.htm";
