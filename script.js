

//les structures conditionnelles
/*var age = parseInt(prompt());


switch (age) {
    case 25:
        console.log("Vous avez 25 ans");
        break;
    case 15:
        console.log("Vous avez 15 ans");
        break;
    case 50:
        console.log("Vous avez 50 ans");
        break;

    default:
        console.log("Aucun age ne vous correspond");
        
        break;
}*/


//les boucles
/*var i = 0;
for (i = 0; i < 8; i--) {
    
    console.log("Tour de boucle N° "+i);
    
}*/
/*while (i<8) {
   console.log("Tour de boucle N° "+i);

   i++;
   
}*/

/*do {
    console.log("Tour de boucle N° "+i);
} while (i<10);*/

/*Table de multiplication
var nombre = prompt("Entrez un nombre pour voir sa table de multiplication :");
nombre = parseInt(nombre); // Convertir en nombre entier

// Afficher la table de multiplication de 0 à 12
for (let index = 0; index <= 12; index++) {
    var resultat = nombre * index;
    console.log(nombre + " x " + index + " = " + resultat);
}
let index = 0;
/*while (index <= 12) {
    var resultat = nombre * index;
    console.log(nombre + " x " + index + " = " + resultat);
    index++;
}

do {
    var resultat = nombre * index;
    console.log(nombre + " x " + index + " = " + resultat);
    index++
} while (index<=12);*/

/*var nom = ["Anna", "Gilles", "Flora", "Steven", "Irène"]
var prenom = [...nom, 'Nicolas', "Emma"] */
//shift() supprime le 1er élément du tab
//unshift() ajoute le 1er élément du tab
// pop() pour voir le dernier élément du tab
// push()  ajoute un élément au tab
// .lenght() voir la taille du tab
// splice ("position de l'element à sup, nombre d'élément à sup, "new élément") ajoute et supprime un élément du tab
// .reverse() pour inverser le tab
// .join() tous les éléments du tab en chaine de caractère
// .split() transformer un string en tab

//les fonctions
//parseInt() convertir une chaine de caractére en nombre
/*var nombre = prompt("Entrez un nombre pour voir sa table de multiplication :");
nombre = parseInt(nombre); */

/*function dire_merci () {
    console.log("Merci");
}

function tab_multi(nombre, limit) {
    if(!(limit && typeof(limit) === "number")){
        limit = prompt("Entrez la limite de la table :");
        limit = parseInt(limit);
    }

    if(nombre && typeof(nombre) === "number"){
        for (let index = 0; index <= limit; index++) {
            console.log(`${nombre} x ${index} = ${index*nombre}`);
        }
    } else {
        console.log("Le paramètre doit être un nombre");
    }
}
dire_merci()
tab_multi()*/

function perimetre(longueur, largeur){
    if(typeof(longueur) === "number" && typeof(largeur) === "number"){
        var resultat = 2 * (longueur +largeur)
    console.log("le périmètre est égal à "+resultat);
    }else{
        console.log("la longueur et la largeur doivent etre des nombres");
        
    }
}
perimetre()

function caree(cote){
    if(cote && typeof(cote) == "number"){
        return cote*cote
    }else{
        return null
    }
}

function aire (cote){
    if(cote && typeof(cote) == "number"){
        return cote*4
    }else{
        return null
    }
}