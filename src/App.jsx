import React, { Component } from "react";
import staticDb from "./db/db.js";
import Card from "./Card.jsx";
import "./firebase.js";
import "./App.css";

// you can read more on
// https://www.smashingmagazine.com/2018/11/guide-pwa-progressive-web-applications/

class App extends Component {
  constructor(props) {
    super(props);
    this.db = staticDb;
    this.state = {
      greenCardsDataProvider: [],
      greenCardsSecTierDataProvider: [],
      greenCardsThirdTierDataProvider: [],
      yellowCardsDataProvider: [],
    };
  }
  componentDidMount() {
    this.identifyCards(this.db);
  }
  getPreviousMonth(currentMonth) {
    let previousMouth = currentMonth - 1;
    if (previousMouth === -1) previousMouth = 11;
    return previousMouth;
  }
  getNextMonth(currentMonth) {
    let nextMounth = currentMonth + 1;
    if (nextMounth === 12) nextMounth = 0;
    return nextMounth;
  }
  getMonthName(month) {
    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2024, month, 1)));
  }
  uniqueArray(arrArg) {
    return arrArg.filter(function (elem, pos, arr) {
      return arr.indexOf(elem) === pos;
    });
  }
  identifyCards(database) {
    if (!database) return;

    let dbClone = database.slice();
    let dbClone2 = database.slice();
    let dbCloneToYellow = database.slice();

    const currentMonth = new Date().getMonth();
    const firstListCards = database.filter((elem, ind) => {
      if (elem.season[currentMonth] === "Forte") {
        dbClone.splice(dbClone.indexOf(elem), 1);
        dbClone2.splice(dbClone2.indexOf(elem), 1);
        dbCloneToYellow.splice(dbCloneToYellow.indexOf(elem), 1);
        return elem;
      }
      return null;
    });

    const secListCards = dbClone.filter((elem, ind) => {
      if (elem.season[this.getPreviousMonth(currentMonth)] === "Forte") {
        dbClone2.splice(ind, 1);
        dbCloneToYellow.splice(dbCloneToYellow.indexOf(elem), 1);
        return elem;
      }
      return null;
    });

    const thirdListCards = dbClone2.filter((elem, ind) => {
      if (elem.season[this.getNextMonth(currentMonth)] === "Forte") {
        dbCloneToYellow.splice(dbCloneToYellow.indexOf(elem), 1);
        return elem;
      }
      return null;
    });

    const yellowListCards = dbCloneToYellow.filter((elem, ind) =>
      elem.season[currentMonth] === "Medio" ||
      elem.season[this.getNextMonth(currentMonth)] === "Medio" ||
      elem.season[this.getPreviousMonth(currentMonth)] === "Medio"
        ? elem
        : null,
    );

    this.setState({ greenCardsDataProvider: firstListCards });
    this.setState({ greenCardsSecTierDataProvider: secListCards });
    this.setState({ greenCardsThirdTierDataProvider: thirdListCards });
    this.setState({ yellowCardsDataProvider: yellowListCards });
  }
  render() {
    const currentMonth = new Date().getMonth();
    const previousMonthName = this.getMonthName(
      this.getPreviousMonth(currentMonth),
    );
    const nextMonthName = this.getMonthName(this.getNextMonth(currentMonth));
    const listItems =
      this.state.greenCardsDataProvider &&
      this.state.greenCardsDataProvider.map((elem, index) => (
        <Card
          key={elem.name + index}
          className="column col-xs-3"
          title={elem.name}
          image={elem.key}
          tip={elem.tip}
        />
      ));
    const secListItems =
      this.state.greenCardsSecTierDataProvider &&
      this.state.greenCardsSecTierDataProvider.map((elem, index) => (
        <Card
          key={elem.name + index}
          className="column col-xs-3"
          title={elem.name}
          image={elem.key}
          tip={elem.tip}
        />
      ));
    const thirdListItems =
      this.state.greenCardsThirdTierDataProvider &&
      this.state.greenCardsThirdTierDataProvider.map((elem, index) => (
        <Card
          key={elem.name + index}
          className="column col-xs-3"
          title={elem.name}
          image={elem.key}
          tip={elem.tip}
        />
      ));
    const yellowListItems =
      this.state.yellowCardsDataProvider &&
      this.state.yellowCardsDataProvider.map((elem, index) => (
        <Card
          key={elem.name + index}
          className="column col-xs-3"
          title={elem.name}
          image={elem.key}
          tip={elem.tip}
        />
      ));
    return (
      <main className="App">
        <section>
          <h1
            style={{
              letterSpacing: "0.1em",
              fontSize: "1rem",
              fontWeight: "normal",
              lineHeight: 1.5,
              margin: "1em 0",
            }}
          >
            <span style={{ fontSize: "2rem" }}>F</span>
            <span style={{ color: "blueviolet", fontSize: "2rem" }}>E</span>
            <span style={{ fontSize: "2rem" }}>I</span>
            <span style={{ color: "cornflowerblue", fontSize: "2rem" }}>R</span>
            <span style={{ color: "gold", fontSize: "2rem" }}>A </span>
            <span style={{ fontSize: "1rem" }}>d</span>
            <span style={{ fontSize: "1rem" }}>a </span>
            <span style={{ color: "green", fontSize: "2rem" }}>F</span>
            <span style={{ color: "blueviolet", fontSize: "2rem" }}>R</span>
            <span style={{ fontSize: "2rem" }}>U</span>
            <span style={{ color: "cornflowerblue", fontSize: "2rem" }}>T</span>
            <span style={{ color: "gold", fontSize: "2rem" }}>A </span>
          </h1>
          <p>
            A sazonalidade é uma característica natural de todos os vegetais e
            plantas. É relacionada à época em que o cultivo rende frutos
            naturalmente, sendo colhidos exatamente no tempo certo e nas
            condições climáticas ideais, o que proporciona um sabor melhor,
            principalmente nas frutas. Além disso, esses alimentos costumam
            apresentar preço mais acessível e são bem mais saudáveis em termos
            de concentração de nutrientes e uso reduzido de agrotóxicos. Por
            isso, veja quais opções temos HOJE para você escolher na hora de ir
            à feira:
          </p>
          <h2 className="h5">A sugestao é levar os seguintes produtos:</h2>
          <div className="container grid-xs">
            <div className="columns-custom">{listItems}</div>
          </div>
        </section>
        <section>
          <h2 className="h5">Boa pedida de {previousMonthName}:</h2>
          <div className="container grid-xs">
            <div className="columns-custom">{secListItems}</div>
          </div>
        </section>
        <section>
          <h2 className="h5">Saindo do forno para {nextMonthName}!</h2>
          <div className="container grid-xs">
            <div className="columns-custom">{thirdListItems}</div>
          </div>
        </section>

        <section>
          <h2 className="h5">Estes voce ainda consegue encontrar:</h2>
          <div className="container grid-xs">
            <div className="columns-custom">{yellowListItems}</div>
          </div>
        </section>
      </main>
    );
  }
}

export default App;
