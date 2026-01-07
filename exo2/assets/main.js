/*sélectionner un élément par son ID
var html = document.getElementById("html")*/

/*Sélectionner un élément dont la class est fournie en parametres(objet Document)
var section = document.getElementsByClassName("section")*/

/*l'élement dont le nom est fourni en paramètre
document.getElementsByName("username")*/

/* Sélectionner à partir de sa balise(getElementByTagName)
var input = document.getElementsByTagName("input")*/

/* Sélectionner à partir de leur sélecteur CSS fourni en paramètres
var section = document.querySelector("section")/ querySelectorAll("section")*/

//getAtribute pour récupérer et setAtribute pour modifier


//innerHTML pour manipuler l'élément, textContent pour récupérer le contenu textuel d'un élément

//Style pour modifier les propriétés CSS du doc
// var article = document.querySelectorAll('.article') [0]
/*article.style.backgroundColor = "black"
article.style.color = "pink"*/

/* addEvenListener = réalise l'abonnement d'une fonction à un 
évènement donné "objet.addEvenListerner(eventype, listenerFunction)" */
// Attendre que le DOM soit chargé
/*document.addEventListener('DOMContentLoaded', () => {
    var h2 = document.querySelector('section#html h2');
    
    var listenerFunction = () => {
        window.alert("Click détecté sur la balise H2")
        // le desabonnement "removeEventListener"
        h2.removeEventListener('click', listenerFunction);
    }
    
    h2.addEventListener('click', listenerFunction);
});*/

window.onload = () =>{
    setupListeners();
}




