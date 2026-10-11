
import { useState } from "react";
import "./App.css";

function App() {
  const [montant, setMontant] = useState(1);
  const [deviseSource, setDeviseSource] = useState("EUR");
  const [deviseCible, setDeviseCible] = useState("MAD");
  const [resultat, setResultat] = useState(null);
  const [taux, setTaux] = useState(null);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  async function convertir() {
    setErreur("");
    setResultat(null);
    setTaux(null);

    if (montant === "" || !Number.isFinite(Number(montant)) || Number(montant) <= 0) {
      setErreur("Veuillez saisir un montant supérieur à zéro.");
      return;
    }

    setChargement(true);

    try {
      const reponse = await fetch("http://127.0.0.1:5000/convertir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          montant: Number(montant),
          deviseSource,
          deviseCible,
        }),
      });

      const donnees = await reponse.json();

      if (!reponse.ok) {
        throw new Error(donnees.erreur || "La conversion a échoué.");
      }

      setResultat(donnees.resultat);
      setTaux(donnees.taux);
    } catch (erreur) {
      setErreur(erreur.message || "Impossible de contacter le backend Flask.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="container">
      <h1>Convertisseur de devises</h1>
      <p>Convertis facilement tes devises.</p>

      <label>Montant</label>
      <input
        type="number"
        min="0"
        step="any"
        value={montant}
        onChange={(e) => setMontant(e.target.value)}
      />

      <label>Devise source</label>
      <select
        value={deviseSource}
        onChange={(e) => setDeviseSource(e.target.value)}
      >
        <option value="EUR">Euro (EUR)</option>
        <option value="MAD">Dirham marocain (MAD)</option>
        <option value="USD">Dollar américain (USD)</option>
      </select>

      <label>Devise cible</label>
      <select
        value={deviseCible}
        onChange={(e) => setDeviseCible(e.target.value)}
      >
        <option value="MAD">Dirham marocain (MAD)</option>
        <option value="EUR">Euro (EUR)</option>
        <option value="USD">Dollar américain (USD)</option>
      </select>

      <button onClick={convertir} disabled={chargement}>
        {chargement ? "Conversion en cours..." : "Convertir"}
      </button>

      {erreur && <p className="error">{erreur}</p>}

      {resultat !== null && (
        <div className="resultat">
          <h2>
            Résultat :{" "}
            {Number(resultat).toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {deviseCible}
          </h2>

          {taux !== null && (
            <p>
              Taux utilisé : 1 {deviseSource} = {taux} {deviseCible}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
