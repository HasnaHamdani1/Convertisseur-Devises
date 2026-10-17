
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app, resources={
    r"/convertir": {
        "origins": [
            "http://localhost:5173",
            "https://convertisseur-devises.dockhosting.dev"
        ]
    }
})


@app.route("/")
def accueil():
    return jsonify({
        "message": "Bienvenue dans le backend du convertisseur de devises !"
    })


@app.route("/convertir", methods=["POST"])
def convertir():
    try:
        donnees = request.get_json()

        if not donnees:
            return jsonify({
                "erreur": "Aucune donnée reçue."
            }), 400

        montant = float(donnees.get("montant", 0))
        devise_source = donnees.get("deviseSource", "").upper()
        devise_cible = donnees.get("deviseCible", "").upper()

        if montant <= 0:
            return jsonify({
                "erreur": "Le montant doit être supérieur à zéro."
            }), 400

        if not devise_source or not devise_cible:
            return jsonify({
                "erreur": "Veuillez sélectionner les deux devises."
            }), 400

        # Si les deux devises sont identiques
        if devise_source == devise_cible:
            taux = 1.0
        else:
            url = (
                f"https://api.frankfurter.dev/v2/"
                f"rate/{devise_source}/{devise_cible}"
            )

            reponse_api = requests.get(url, timeout=10)
            reponse_api.raise_for_status()

            donnees_api = reponse_api.json()
            taux = float(donnees_api["rate"])

        resultat = montant * taux

        return jsonify({
            "message": "Conversion réussie !",
            "montant": montant,
            "deviseSource": devise_source,
            "deviseCible": devise_cible,
            "taux": taux,
            "resultat": round(resultat, 2)
        })

    except ValueError:
        return jsonify({
            "erreur": "Le montant ou les données sont invalides."
        }), 400

    except requests.RequestException:
        return jsonify({
            "erreur": "Impossible de récupérer le taux de change. Réessayez plus tard."
        }), 502

    except (KeyError, TypeError):
        return jsonify({
            "erreur": "La réponse de l'API est invalide."
        }), 502


if __name__ == "__main__":
    app.run(debug=True, port=5000)
