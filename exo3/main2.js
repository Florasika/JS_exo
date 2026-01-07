var element = (name) => {
    if (name && typeof name === "string") {
        return document.createElement(name);
    }
    return null;
};

var text = (content) => {
    if (content && typeof content === "string") {
        return document.createTextNode(content);
    }
    return null;
};

var ul = element("ul");

for (let i = 0; i < 9; i++) {
    let li = element("li");
    let content = text("Element javascript N°" + i);

    if (li && content) {
        li.appendChild(content);
        ul.appendChild(li);
    }
}

//console.log(ul);
document.getElementById("app").appendChild(ul)
// document.body.appendChild(ul); // à activer si tu veux l'afficher dans la page
