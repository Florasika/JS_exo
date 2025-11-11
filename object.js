//les objects en JS
//var voiture = new Object()
/*var voiture = {
    marque : "BMW",
    nom : "M2 compétition",
    year : 2020
}

var moto ={...voiture, marque: "ferrari"}*/

/*propriétées de la voiture
voiture.marque = "BMW" 
voiture.nom = "M2 compétition"
voiture.year = 2020*/

var personne = {
    nom : "Toto",
    prenom : "Monier",
    email : "toto@gmail.com",
    tel : 123456,
    adresse : {
        num_rue : "20 rue des marmites",
        code_postal : 31100,
        pays : "Brésil"
    },
    //méthode
    fullname: function(){
        return this.nom+"  "+this.prenom
    },
    Bonjour: function(){
        return "Bonjour "+this.fullname()
    }
}
