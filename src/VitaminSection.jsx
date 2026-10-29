import {
  centrumAdultTargets,
  centrumAdultMineralTargets,
  centrumDailyMenu,
  centrumFormulaSource,
  centrumMineralFormulaSource,
} from "./db/centrumDailyMenu.js";
import { mineralUnits } from "./db/mineralProfiles.js";
import "./VitaminSection.css";

function convertAmount(amount, fromUnit, toUnit) {
  if (fromUnit === toUnit) return amount;
  if (fromUnit === "mg" && toUnit === "µg") return amount * 1000;
  if (fromUnit === "µg" && toUnit === "mg") return amount / 1000;
  throw new Error(`Unsupported nutrient unit conversion: ${fromUnit} to ${toUnit}`);
}

function calculateNutrient(menu, database, nutrientKey, category, targetUnit) {
  let amount = 0;
  let complete = true;

  menu.forEach(({ foods }) => {
    foods.forEach(({ key, grams }) => {
      const food = database.find((item) => item.key === key);
      const profile = category === "minerals"
        ? food?.nutrients?.mineralsPer100g
        : food?.nutrients?.per100g;
      const value = profile?.[nutrientKey];

      if (typeof value !== "number") {
        complete = false;
        return;
      }

      const sourceUnit =
        category === "minerals" ? mineralUnits[nutrientKey].unit : targetUnit;
      amount += (convertAmount(value, sourceUnit, targetUnit) * grams) / 100;
    });
  });

  return { amount, complete };
}

function formatAmount(amount) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(amount);
}

function NutrientComparisonTable({ targets, database, category, label }) {
  return (
    <>
      <h4 className="nutrient-group-title">{label}</h4>
      <div className="nutrient-table-wrap">
        <table className="nutrient-table">
          <caption>
            Valores estimados no cardápio comparados à quantidade declarada
            por comprimido de Centrum Adulto ({label.toLowerCase()}).
          </caption>
          <thead>
            <tr>
              <th scope="col">Nutriente</th>
              <th scope="col">Centrum Adulto</th>
              <th scope="col">Cardápio</th>
              <th scope="col">Cobertura estimada</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((target) => {
              if (!target.key || target.notComparable) {
                const reason = target.notComparable
                  ? "Não calculado: unidade/quantidade do rótulo precisa ser confirmada"
                  : "Não calculado: dado ausente na base";

                return (
                  <tr key={target.name}>
                    <th scope="row">{target.name}</th>
                    <td>
                      {formatAmount(target.amount)} {target.unit}
                    </td>
                    <td colSpan="2">{reason}</td>
                  </tr>
                );
              }

              const result = calculateNutrient(
                centrumDailyMenu,
                database,
                target.key,
                category,
                target.unit,
              );
              const coverage = (result.amount / target.amount) * 100;
              const estimatePrefix = result.complete ? "" : "≥ ";
              const partialLabel = result.complete
                ? ""
                : " (parcial; faltam dados)";

              return (
                <tr key={target.name}>
                  <th scope="row">{target.name}</th>
                  <td>
                    {formatAmount(target.amount)} {target.unit}
                  </td>
                  <td>
                    {estimatePrefix}
                    {formatAmount(result.amount)} {target.unit}
                    {partialLabel}
                  </td>
                  <td>
                    {estimatePrefix}
                    {formatAmount(coverage)}%
                    {partialLabel}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function VitaminSection({ database }) {
  const totalGrams = centrumDailyMenu.reduce(
    (total, meal) =>
      total + meal.foods.reduce((mealTotal, food) => mealTotal + food.grams, 0),
    0,
  );

  return (
    <section className="vitamins-panel" aria-labelledby="vitamins-title">
      <h2 className="section-title" id="vitamins-title">
        Vitaminas e minerais nos alimentos in natura
      </h2>
      <p className="vitamins-copy">
        Não existe equivalência direta entre um comprimido multivitamínico e
        alimentos. A composição varia por alimento e porção; o exemplo abaixo
        compara um cardápio com os valores declarados para{" "}
        <strong>1 comprimido de Centrum Adulto</strong>.
      </p>

      <section className="daily-menu" aria-labelledby="daily-menu-title">
        <h3 className="section-title" id="daily-menu-title">
          Exemplo de cardápio diário com itens da sua base
        </h3>
        <p className="daily-menu-intro">
          Porções ilustrativas, pesadas pela parte comestível. O total é de{" "}
          <strong>{totalGrams} g</strong> de frutas e hortaliças.
        </p>
        <div className="daily-meals">
          {centrumDailyMenu.map((meal) => (
            <section className="daily-meal" key={meal.meal}>
              <h4>{meal.meal}</h4>
              <ul>
                {meal.foods.map((food) => {
                  const produce = database.find((item) => item.key === food.key);
                  return (
                    <li key={food.key}>
                      <span>{food.portion}</span>
                      <strong>
                        {produce?.name || food.key} — {food.grams} g
                      </strong>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section
        className="nutrient-comparison"
        aria-labelledby="nutrient-comparison-title"
      >
        <h3 className="section-title" id="nutrient-comparison-title">
          Estimativa em relação à fórmula
        </h3>
        <NutrientComparisonTable
          targets={centrumAdultTargets}
          database={database}
          category="vitamins"
          label="Vitaminas"
        />
        <NutrientComparisonTable
          targets={centrumAdultMineralTargets}
          database={database}
          category="minerals"
          label="Minerais"
        />
        <p className="nutrient-footnote">
          Cálculo aproximado a partir dos perfis da{" "}
          <a href="https://www.tbca.net.br/" target="_blank" rel="noreferrer">
            Tabela Brasileira de Composição de Alimentos (TBCA)
          </a>
          , por 100 g. Percentuais com “≥” somam apenas valores quantificados;
          não são uma medição completa. A base atual não inclui vitamina B5,
          vitamina K, biotina, cromo, iodo, molibdênio ou cloro. O potássio do
          rótulo aparece como 10 µg, mas sua unidade/quantidade precisa ser
          confirmada antes de calcular a cobertura. Por isso, não é possível
          afirmar equivalência nutricional total. Os valores do Centrum seguem a{" "}
          <a href={centrumFormulaSource} target="_blank" rel="noreferrer">
            tabela nutricional da fórmula
          </a>{" "}
          indicada como referência; os minerais seguem a{" "}
          <a
            href={centrumMineralFormulaSource}
            target="_blank"
            rel="noreferrer"
          >
            bula consultada
          </a>
          .
        </p>
        <p className="health-disclaimer">
          Este exemplo é informativo e não substitui orientação profissional,
          avaliação de deficiências ou uso de suplemento prescrito.
        </p>
      </section>
    </section>
  );
}

export default VitaminSection;
