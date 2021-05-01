
//Gloabal events handling
window.addEventListener('load', () => {
    localStorageHelper.populateState();
});

//DOM static elements
var container = document.getElementById('items_container');
var contactImgToSet = document.getElementById('contact_picture');

//img notification
var contactImgToSend = document.getElementById('img_preview');

//DOM events triggers
var addItemTrigger = document.getElementById('sendData');

//Dynamic global program values
let fromLoadIdentifier = 0;

//program helpers

//controls dom updates utilitary
var fromLoadSwitch = () => {
    fromLoadIdentifier = 0;
}

//Event handling
addItemTrigger.addEventListener('click', (event) => {
    event.preventDefault();
    //Retrive data from the DOM
    DOMDataRetriever();
})

//database initialization
var localStorage = window.localStorage;

//database access helper
var localStorageHelper = {
    state: [],
    populateState: () => {
        //Clear all the data in the current state
        localStorageHelper.state = []
        for (let i = 0; i < localStorage.length; i++) {
            let contactItem = localStorage.getItem(localStorage.key(i));
            contactItem = JSON.parse(contactItem);
            localStorageHelper.state.push(contactItem);
        };
        globalState.state = localStorageHelper.state.reverse();
        console.log(globalState.state);
        globalState.updateDOM();
        
        return;
    },
    updateDatabase: newState => {
        console.log(newState);
        window.localStorage.clear();
        for (let i = 0; i < newState.length; i++) {
            contactString = JSON.stringify(newState[i]);
            window.localStorage.setItem(newState[i].id, contactString);
        };
        //after upadated the dom, we clean up the current state in order to charge it by data coming from the database
        globalState.state = [];
        console.log(globalState.state);

        //call to the appropriate method for the the state upadating
        localStorageHelper.populateState();
    }
};

//app global state management object
var globalState = {
    state: [],
    updateDOM: () => {
        console.log(globalState.state.length);
        //Anounce the new up-to-date data to come
        fromLoadSwitch();
        for (let i = 0; i < globalState.state.length; i++) {
            fillTheDOM(globalState.state[i]);
        }
    },
    updateStatebyAdd: itemContact => {
        state = globalState.state;
        state.push(itemContact);
        localStorageHelper.updateDatabase(state);
    },
    updateStatebyRemove: contactID => {
        state = globalState.state;
        state = globalState.state.filter(contact => {
            return contact.id !== contactID;
        });
        localStorageHelper.updateDatabase(state);
    }

}

//DOM connectivity helpers
var fillTheDOM = contactObjectItem => {
    if (fromLoadIdentifier === 0) {
        //if we are about the first page load;
        container.innerHTML = '';
        fromLoadIdentifier = 1;
    }
    console.log(fromLoadIdentifier);
    //remove all the old data in the container
    var list_item = document.createElement('div');
    list_item.setAttribute('id', 'list_item');
    var cred = document.createElement('div');
    cred.setAttribute('id', 'cred');
    var pict_block = document.createElement('div');
    pict_block.setAttribute('id', 'picture_block');
    var contact_cred = document.createElement('div');
    contact_cred.setAttribute('id', 'contact_cred');
    var profile_img = document.createElement('img');
    profile_img.setAttribute('alt', 'contact_profile');
    var pPrenom = document.createElement('p');
    pPrenom.setAttribute('id', 'contact_first_name');
    var pGroupe = document.createElement('p');
    pGroupe.setAttribute('id', 'contact_group');
    var pBio = document.createElement('p');
    pBio.setAttribute('id', 'contact_bio');
    var pClose = document.createElement('p');
    pClose.setAttribute('id', 'removeItem');
    pClose.innerHTML = 'X';

    //Inserting elements each other
    list_item.appendChild(cred);
    list_item.appendChild(pClose);
    cred.appendChild(pict_block);
    cred.appendChild(contact_cred);
    pict_block.appendChild(profile_img);
    contact_cred.appendChild(pPrenom);
    contact_cred.appendChild(pGroupe);
    contact_cred.appendChild(pBio);
    
    //img reception notify
    contactImgToSend.src = contactObjectItem.img_path;

    //item filling
    profile_img.setAttribute('src', contactObjectItem.img_path);
    pPrenom.innerText = contactObjectItem.prenom;
    pGroupe.innerText = contactObjectItem.groupe;
    pBio.innerText = contactObjectItem.bio;

    //Insert the id of the contact item in the name attribute of the contact dom element
    // pClose.setAttribute('name', contactObjectItem.id);

    //closing click handler
    pClose.addEventListener('click', function (event) {
        //Getting the contact DOM object
        var item = event.currentTarget.parentNode;
        console.log(pClose);
        console.log(item);

        //retrieve the value of the attribute in which we stocked the id
        let contactID = pClose.getAttribute('name');
        console.log(contactID);

        //call to the remove method of the state manager object
        globalState.updateStatebyRemove(contactObjectItem.id);

        //little animation to avoid the user get frustracted while operations are being excuted
        item.style.transition = "1s all";
        item.style.backgroundColor = "rgba(0, 0, 155, 0.5)";
        item.style.transform = "translate(0, 100%)";

        //Wait the transition end
        window.setTimeout(() => {
            item.removeChild(pClose);
        }, 1000);
    });
    container.appendChild(list_item);

    return;
}

//contact item object build
var contactObjectBuilder = function (img_path, prenom, groupe, bio) {
    //item object creation
    var contactObjectItem = {};

    //Object settings
    contactObjectItem.id = (Math.random().toString() + nom.toString() + prenom.toString() + bio.toString()).toString();
    contactObjectItem.img_path = img_path;
    contactObjectItem.prenom = prenom;
    contactObjectItem.groupe = groupe;
    contactObjectItem.bio = bio;

    globalState.updateStatebyAdd(contactObjectItem);

    return;
}

//Retrieve data input from the DOM
let DOMDataRetriever = function () {
    const prenom = document.getElementById('prenom').value;
    const nom = document.getElementById('nom').value;
    const groupe = document.getElementById('groupe').value;
    const bio = document.getElementById('bio').value;
    const profileImgPath = URL.createObjectURL(contactImgToSet.files[0]);

    //update the state
    contactObjectBuilder(profileImgPath, prenom, groupe, bio);
    return
}

