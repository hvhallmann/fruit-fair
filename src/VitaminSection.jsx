import {
  centrumAdultTargets,
  centrumDailyMenu,
  centrumFormulaSource,
} from "./db/centrumDailyMenu.js";
import "./VitaminSection.css";

function calculateNutrient(menu, database, nutrientKey) {
  let amount = 0;
  let complete = true;

  menu.forEach(({ foods }) => {
    foods.forEach(({ key, grams }) => {
      const food = database.find((item) => item.key === key);
      const value = food?.nutrients?.per100g[nutrientKey];

      if (typeof value !== "number") {
        complete = false;
        return;
      }

      amount += (value * grams) / 100;
    });
  });

  return { amount, complete };
}

function formatAmount(amount) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(amount);
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
        Vitaminas nos alimentos in natura
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
        <div className="nutrient-table-wrap">
          <table className="nutrient-table">
            <caption>
              Valores estimados no cardápio comparados à quantidade declarada
              por comprimido de Centrum Adulto.
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
              {centrumAdultTargets.map((target) => {
                if (!target.key) {
                  return (
                    <tr key={target.name}>
                      <th scope="row">{target.name}</th>
                      <td>
                        {formatAmount(target.amount)} {target.unit}
                      </td>
                      <td colSpan="2">Não calculado: dado ausente na base</td>
                    </tr>
                  );
                }

                const result = calculateNutrient(
                  centrumDailyMenu,
                  database,
                  target.key,
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
        <p className="nutrient-footnote">
          Cálculo aproximado a partir dos perfis da{" "}
          <a href="https://www.tbca.net.br/" target="_blank" rel="noreferrer">
            Tabela Brasileira de Composição de Alimentos (TBCA)
          </a>
          , por 100 g. Percentuais com “≥” somam apenas valores quantificados;
          não são uma medição completa. A base atual não inclui vitamina B5,
          vitamina K, biotina nem os minerais da fórmula, então não é possível
          afirmar equivalência nutricional total. Os valores do Centrum seguem
          a{" "}
          <a href={centrumFormulaSource} target="_blank" rel="noreferrer">
            tabela nutricional da fórmula
          </a>{" "}
          indicada como referência.
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
