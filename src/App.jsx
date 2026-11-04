import React, { Component } from "react";
import staticDb from "./db/dbWithNutrients.js";
import Card from "./Card.jsx";
import ProfileSection from "./ProfileSection.jsx";
import VitaminSection from "./VitaminSection.jsx";
import {
  deleteUserProfile,
  demoUserProfile,
  emptyUserProfile,
  loadUserProfile,
  saveUserProfile,
} from "./db/profileStorage.js";
import {
  deleteCloudUserProfile,
  loadCloudUserProfile,
  saveCloudUserProfile,
} from "./db/cloudProfileStorage.js";
import "./firebase.js";
import "./App.css";

// you can read more on
// https://www.smashingmagazine.com/2018/11/guide-pwa-progressive-web-applications/

class App extends Component {
  constructor(props) {
    super(props);
    this.db = staticDb;
    this.state = {
      activePage: "seasonal",
      selectedMonth: new Date().getMonth(),
      userProfile: demoUserProfile,
      profileDraft: emptyUserProfile,
      isProfileSaved: false,
      isProfileLoading: true,
      profileStorageError: "",
      profileMigrationPending: false,
      greenCardsDataProvider: [],
      greenCardsSecTierDataProvider: [],
      greenCardsThirdTierDataProvider: [],
      yellowCardsDataProvider: [],
    };
  }
  componentDidMount() {
    this.identifyCards(this.db, this.state.selectedMonth);
    this.loadProfiles();
  }
  handleMonthChange = (offset) => {
    const selectedMonth = (this.state.selectedMonth + offset + 12) % 12;
    this.setState({ selectedMonth });
    this.identifyCards(this.db, selectedMonth);
  };
  loadProfiles = async () => {
    const [localResult, cloudResult] = await Promise.allSettled([
      loadUserProfile(),
      loadCloudUserProfile(),
    ]);
    const localProfile =
      localResult.status === "fulfilled" ? localResult.value : null;
    const cloudProfile =
      cloudResult.status === "fulfilled" ? cloudResult.value : null;
    const errors = [];

    if (localResult.status === "rejected") {
      errors.push(`cópia local: ${localResult.reason.message}`);
    }
    if (cloudResult.status === "rejected") {
      errors.push(`Firebase: ${cloudResult.reason.message}`);
    }

    if (cloudProfile) {
      this.setState({
        userProfile: cloudProfile,
        profileDraft: cloudProfile,
        isProfileSaved: true,
        isProfileLoading: false,
        profileStorageError: errors.join(" "),
      });
      if (localResult.status === "fulfilled") {
        saveUserProfile(cloudProfile).catch((error) => {
          this.setState({
            profileStorageError: `Perfil carregado do Firebase, mas não foi possível atualizar a cópia local: ${error.message}`,
          });
        });
      }
      return;
    }

    this.setState({
      userProfile: localProfile ?? demoUserProfile,
      profileDraft: localProfile ?? emptyUserProfile,
      isProfileSaved: Boolean(localProfile),
      isProfileLoading: false,
      profileMigrationPending:
        cloudResult.status === "fulfilled" && Boolean(localProfile),
      profileStorageError: errors.join(" "),
    });
  };
  handleProfileChange = (userProfile) => {
    this.setState({ profileDraft: userProfile });
  };
  handleProfileSave = async (userProfile) => {
    await saveCloudUserProfile(userProfile);
    this.setState({
      userProfile,
      profileDraft: userProfile,
      isProfileSaved: true,
      profileMigrationPending: false,
      profileStorageError: "",
    });
    try {
      await saveUserProfile(userProfile);
    } catch (error) {
      this.setState({
        profileStorageError: `Perfil salvo no Firebase, mas não foi possível atualizar a cópia local: ${error.message}`,
      });
    }
  };
  handleProfileDelete = async () => {
    await deleteCloudUserProfile();
    this.setState({
      userProfile: demoUserProfile,
      profileDraft: emptyUserProfile,
      isProfileSaved: false,
      profileMigrationPending: false,
      profileStorageError: "",
    });
    try {
      await deleteUserProfile();
    } catch (error) {
      this.setState({
        profileStorageError: `Perfil apagado do Firebase, mas não foi possível apagar a cópia local: ${error.message}`,
      });
    }
  };
  handleProfileMigration = async () => {
    await saveCloudUserProfile(this.state.profileDraft);
    this.setState({
      isProfileSaved: true,
      profileMigrationPending: false,
      profileStorageError: "",
    });
  };
  handleKeepProfileLocal = () => {
    this.setState({ profileMigrationPending: false });
  };
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
  identifyCards(database, currentMonth) {
    if (!database) return;

    let dbClone = database.slice();
    let dbClone2 = database.slice();
    let dbCloneToYellow = database.slice();

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
    const currentMonth = this.state.selectedMonth;
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
          storageTip={elem.storageTip}
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
          storageTip={elem.storageTip}
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
          storageTip={elem.storageTip}
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
          storageTip={elem.storageTip}
        />
      ));
    return (
      <main className="App">
        <header className="page-header">
          <h1 className="brand">
            <span className="brand-word">FEIRA</span>
            <span className="brand-connector">da</span>
            <span className="brand-word brand-word-accent">FRUTA</span>
          </h1>
        </header>
        <nav className="page-tabs" aria-label="Navegação principal">
          <button
            type="button"
            className="page-tab"
            aria-current={this.state.activePage === "seasonal" ? "page" : undefined}
            onClick={() => this.setState({ activePage: "seasonal" })}
          >
            Feira do mês
          </button>
          <button
            type="button"
            className="page-tab"
            aria-current={this.state.activePage === "profile" ? "page" : undefined}
            onClick={() => this.setState({ activePage: "profile" })}
          >
            Meu perfil
          </button>
          <button
            type="button"
            className="page-tab"
            aria-current={this.state.activePage === "vitamins" ? "page" : undefined}
            onClick={() => this.setState({ activePage: "vitamins" })}
          >
            Vitaminas e minerais
          </button>
        </nav>
        {this.state.activePage === "seasonal" ? (
          <div>
            {import.meta.env.DEV && (
              <nav
                className="month-test-controls"
                aria-label="Controles de teste de mês"
              >
                <button
                  type="button"
                  className="page-tab"
                  aria-label="Mês anterior"
                  onClick={() => this.handleMonthChange(-1)}
                >
                  Anterior
                </button>
                <span aria-live="polite">
                  Mês de referência: {this.getMonthName(currentMonth)}
                </span>
                <button
                  type="button"
                  className="page-tab"
                  aria-label="Próximo mês"
                  onClick={() => this.handleMonthChange(1)}
                >
                  Próximo
                </button>
              </nav>
            )}
            <p className="intro-copy">
              A sazonalidade é uma característica natural de todos os vegetais e
              plantas. É relacionada à época em que o cultivo rende frutos
              naturalmente, sendo colhidos exatamente no tempo certo e nas
              condições climáticas ideais, o que proporciona um sabor melhor,
              principalmente nas frutas. Além disso, esses alimentos costumam
              apresentar preço mais acessível e são bem mais saudáveis em termos
              de concentração de nutrientes e uso reduzido de agrotóxicos. Por
              isso, veja quais opções temos HOJE para você escolher na hora de
              ir à feira:
            </p>
            <section className="season-section">
              <h2 className="section-title">
                A sugestão é levar os seguintes produtos:
              </h2>
              <div className="produce-grid">
                <div className="columns-custom">{listItems}</div>
              </div>
            </section>
            <section className="season-section">
              <h2 className="section-title">
                Boa pedida de {previousMonthName}:
              </h2>
              <div className="produce-grid">
                <div className="columns-custom">{secListItems}</div>
              </div>
            </section>
            <section className="season-section">
              <h2 className="section-title">
                Saindo do forno para {nextMonthName}!
              </h2>
              <div className="produce-grid">
                <div className="columns-custom">{thirdListItems}</div>
              </div>
            </section>
            <section className="season-section">
              <h2 className="section-title">
                Estes você ainda consegue encontrar:
              </h2>
              <div className="produce-grid">
                <div className="columns-custom">{yellowListItems}</div>
              </div>
            </section>
          </div>
        ) : this.state.activePage === "profile" ? (
          <ProfileSection
            profile={this.state.profileDraft}
            isLoading={this.state.isProfileLoading}
            isSaved={this.state.isProfileSaved}
            storageError={this.state.profileStorageError}
            profileMigrationPending={this.state.profileMigrationPending}
            onChange={this.handleProfileChange}
            onSave={this.handleProfileSave}
            onDelete={this.handleProfileDelete}
            onMigrate={this.handleProfileMigration}
            onKeepLocal={this.handleKeepProfileLocal}
          />
        ) : (
          <VitaminSection
            database={this.db}
            monthIndex={currentMonth}
            userProfile={this.state.userProfile}
          />
        )}
      </main>
    );
  }
}

export default App;
