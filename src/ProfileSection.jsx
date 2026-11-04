import { useState } from "react";
import "./ProfileSection.css";

const activityLevels = [
  { value: "sedentary", label: "Sedentário — pouco ou nenhum exercício" },
  { value: "light", label: "Leve — atividade leve 1 a 3 dias por semana" },
  { value: "moderate", label: "Moderado — atividade 3 a 5 dias por semana" },
  { value: "high", label: "Alto — atividade intensa 6 a 7 dias por semana" },
  {
    value: "very-high",
    label: "Muito alto — atividade intensa ou trabalho físico",
  },
];

function ProfileSection({
  profile,
  isLoading,
  isSaved,
  isSaving: isSavingParent = false,
  storageError,
  profileMigrationPending,
  onChange,
  onSave,
  onDelete,
  onMigrate,
  onKeepLocal,
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      await onSave({
        ...profile,
        name: profile.name.trim(),
        email: profile.email.trim(),
        heightCm: Number(profile.heightCm),
        weightKg: Number(profile.weightKg),
        energyTargetKcal: Number(profile.energyTargetKcal),
      });
      setMessage("Perfil salvo no Firebase e neste dispositivo.");
    } catch (error) {
      setMessage(`Não foi possível salvar o perfil: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setMessage("");

    try {
      await onDelete();
      setMessage("Perfil apagado do Firebase e deste dispositivo.");
    } catch (error) {
      setMessage(`Não foi possível apagar o perfil: ${error.message}`);
    }
  }

  async function handleMigrate() {
    setIsMigrating(true);
    setMessage("");

    try {
      await onMigrate();
      setMessage("Perfil enviado ao Firebase.");
    } catch (error) {
      setMessage(`Não foi possível enviar o perfil: ${error.message}`);
    } finally {
      setIsMigrating(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    onChange({ ...profile, [name]: value });
  }

  return (
    <section className="profile-panel" aria-labelledby="profile-title">
      <h2 className="section-title" id="profile-title">
        Meu perfil
      </h2>
      <p className="profile-intro">
        Informe seus dados para personalizar o cardápio sazonal. A meta
        energética é informada por você; o app não a calcula a partir do peso,
        da altura ou da atividade.
      </p>
      {storageError && (
        <p className="profile-error" role="alert">
          Problema ao sincronizar o perfil: {storageError}
        </p>
      )}
      {profileMigrationPending && (
        <div
          className="profile-privacy"
          role="group"
          aria-label="Migração do perfil"
        >
          <p>
            Encontramos um perfil salvo neste dispositivo, mas ainda não na
            nuvem. Você pode enviá-lo ao Firebase ou mantê-lo apenas localmente.
          </p>
          <button type="button" disabled={isMigrating} onClick={handleMigrate}>
            {isMigrating ? "Enviando…" : "Enviar perfil existente ao Firebase"}
          </button>
          <button type="button" disabled={isMigrating} onClick={onKeepLocal}>
            Manter apenas neste dispositivo
          </button>
        </div>
      )}
      {isLoading ? (
        <p role="status">Carregando o perfil salvo neste dispositivo…</p>
      ) : (
        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            Nome
            <input
              autoComplete="name"
              name="name"
              required
              value={profile.name}
              onChange={handleChange}
            />
          </label>
          <label>
            Altura (cm)
            <input
              autoComplete="off"
              inputMode="decimal"
              max="260"
              min="50"
              name="heightCm"
              required
              type="number"
              value={profile.heightCm}
              onChange={handleChange}
            />
          </label>
          <label>
            Peso (kg)
            <input
              autoComplete="off"
              inputMode="decimal"
              max="500"
              min="10"
              name="weightKg"
              required
              step="0.1"
              type="number"
              value={profile.weightKg}
              onChange={handleChange}
            />
          </label>
          <label>
            E-mail (opcional)
            <input
              autoComplete="email"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
            />
          </label>
          <label>
            Necessidade energética estimada (kcal/dia)
            <input
              inputMode="numeric"
              max="10000"
              min="500"
              name="energyTargetKcal"
              required
              step="50"
              type="number"
              value={profile.energyTargetKcal}
              onChange={handleChange}
            />
          </label>
          <label>
            Nível de atividade
            <select
              name="activityLevel"
              required
              value={profile.activityLevel}
              onChange={handleChange}
            >
              <option value="" disabled>
                Selecione o nível de atividade
              </option>
              {activityLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </label>
          <div className="profile-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving || isSavingParent ? "Salvando…" : "Salvar perfil"}
            </button>
            {isSaved && (
              <button
                type="button"
                className="profile-delete-button"
                disabled={isSaving || isSavingParent}
                onClick={handleDelete}
              >
                Apagar dados salvos
              </button>
            )}
          </div>
          {message && (
            <p className="profile-status" role="status">
              {message}
            </p>
          )}
        </form>
      )}
    </section>
  );
}

export default ProfileSection;
