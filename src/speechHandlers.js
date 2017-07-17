'use strict';

var config = require('./configuration');
var constants = require('./constants');

var speechHandlers = {
    'welcome' : function() {
        // Output welcome message with card
        var message = config.welcome_message + constants.breakTime['100'] +
            ' Du kannst eine Kategorie aus den folgenden Kategorien auswählen : ';
        var reprompt = 'Du kannst nach folgenden Kategorien fragen : ';
        var cardTitle = config.welcome_message;
        var cardContent = config.welcome_message + ' Du kannst eine Kategorie aus den folgenden Kategorien auswählen : \n';
        // Call category helper to get list of all categories
        categoryHelper((categoryList, cardCategoryList) => {
            message += categoryList;
            reprompt += categoryList;
            cardContent += cardCategoryList;
            this.emit(':askWithCard', message, reprompt, cardTitle, cardContent, null);
        });
    },
    'listCategories' : function () {
        // Output the list of all feeds with card
        var message;
        var reprompt = 'Du kannst nach folgenden Kategorien fragen : ';
        var cardTitle = 'Liste der Kategorien';
        var cardContent;

        // changing state to START MODE
        this.handler.state = constants.states.START_MODE;
        // Call category helper to get list of all categories
        categoryHelper((categoryList, cardCategoryList) => {
            message = categoryList;
            reprompt += categoryList;
            cardContent = cardCategoryList;
            this.emit(':askWithCard', message, reprompt, cardTitle, cardContent, null);
        })
    },
    'illegalCategory' : function () {
        // Output sorry message when category not recognized along with a request to choose the category
        var message = 'Sorry, I could not understand. You can select any of the following categories : ';
        var reprompt = 'You can ask for any of the following categories : ';
        // Call category helper to get list of all categories
        categoryHelper((categoryList) => {
            message += categoryList;
            reprompt += categoryList;
            this.emit(':ask', message, reprompt);
        })
    },
    'listFavorite' : function () {
        // Output list of feeds marked as favorite by the user
        var message;
        var reprompt;
        var cardTitle = 'Favoriten';
        var cardContent;

        var favoriteList = this.attributes['favoriteCategories'];
        var favoriteListLength = favoriteList.length;
        if (favoriteListLength === 0) {
            return this.emit('favoriteListEmpty');
        } else if (favoriteListLength === 1) {
            message = favoriteList[0] + ' ist deine favorisierte Kategorie. ' +
                'Du kannst sagen, öffne meine Favoriten, um deine favorisierten Kategorien anzuhören. ';
            cardContent = message;
            reprompt = 'Du hast ' + favoriteList[0] + ' als favorisierte Kategorie markiert.' +
                'Du kannst sagen, öffne meine Favoriten, um deine favorisierten Kategorien anzuhören.';
        } else {
            message = '';
            reprompt = 'Deine favorisierten Kategorien sind : ';
            cardContent = 'Deine favorisierten Kategorien sind : \n';
            for (var index = 0; index < favoriteListLength; index++) {
                message += (index+1) + ' . ' + favoriteList[index] + constants.breakTime['300'];
                cardContent += (index+1) + '. ' + favoriteList[index] + '\n';
                reprompt += (index+1) + ' . ' + favoriteList[index] + constants.breakTime['300'];
            }
            message += ' Du kannst sagen, öffne meine Favoriten um deine favorisierten Kategorien anzuhören.';
            cardContent += 'Du kannst sagen, öffne meine Favoriten um deine favorisierten Kategorien anzuhören.';
            reprompt += ' Du kannst sagen, öffne meine Favoriten um deine favorisierten Kategorien anzuhören.';
        }
        this.emit(':askWithCard', message, reprompt, cardTitle, cardContent, null);
    },
    'favoriteAdded' : function (category) {
        // Output success message when feed marked as favorite
        if (this.attributes['category'] === 'Favoriten') {
            // Switch to START MODE since favorite feed has been altered
            this.handler.state = constants.states.START_MODE;
        }
        var message = category + ' wurde zu deinen Favoriten hinzugefügt. ' +
            'Du kannst sagen, öffne die Favoriten, um deine favorisierten Kategorien anzuhören.';
        var reprompt = 'Du kannst sagen, öffne die Favoriten, um deine favorisierten Kategorien anzuhören.';
        this.emit(':ask', message, reprompt);
    },
    'favoriteRemoved' : function (category) {
        // Output success message when feed removed as favorite
        if (this.attributes['category'] === 'Favoriten') {
            // Switch to START MODE since favorite feed has been altered
            this.handler.state = constants.states.START_MODE;
        }
        var message = category + ' wurde aus deine Favoriten gelöscht. ' +
            'Du kannst sagen, öffne die Favoriten, um deine favorisierten Kategorien anzuhören.';
        var reprompt = 'Du kannst sagen, öffne die Favoriten, um deine favorisierten Kategorien anzuhören.';
        this.emit(':ask', message, reprompt);
    },
    'favoriteAddExistingError' : function (category) {
        // Output message when feed is already marked as favorite
        var message = category + ' befindet sich bereits in deinen Favoriten. ' +
            'Du kannst sagen, öffne die Favoriten, um deine favorisierten Kategorien anzuhören.';
        var reprompt = 'Du kannst sagen, öffne die Favoriten, um deine favorisierten Kategorien anzuhören.';
        this.emit(':ask', message, reprompt);
    },
    'favoriteRemoveExistingError' : function (category) {
        // Output message when feed is already absent from favorite
        var message = category + ' war nicht in deinen Favoriten. ' +
            'Du kannst sagen, öffne die Favoriten, um deine favorisierten Kategorien anzuhören.';
        var reprompt = 'Du kannst sagen, öffne die Favoriten, um deine favorisierten Kategorien anzuhören.';
        this.emit(':ask', message, reprompt);
    },
    'favoriteAddCurrentError' : function () {
        var message = 'Entschuldige bitte, ich kann diese Kategorie nicht zu deinen Favoriten hinzufügen.';
        var reprompt = 'Du kannst mehr sagen, um mehr Elemente zu erhalten.';
        this.emit(':ask', message, reprompt);
    },
    'favoriteRemoveCurrentError' : function () {
        var message = 'Entschuldige bitte, ich kann diese Kategorie nicht aus deinen Favoriten entfernen.';
        var reprompt = 'Du kannst mehr sagen, um mehr Elemente zu erhalten.';
        this.emit(':ask', message, reprompt);
    },
    'favoriteListEmpty' : function () {
        var message = 'Du hast keine Kategorie als Favorit markiert. ' +
            'Du kannst sagen, markiere ' + Object.keys(config.feeds)[0] + '  als Favorit.';
        var reprompt = 'Deine Favoriten Liste ist leer. ' +
            'Du kannst sagen, markiere ' + Object.keys(config.feeds)[0] + '  als Favorit.';
        this.emit(':ask', message, reprompt);
    },
    'noNewItems' : function () {
        // Output message when no new items present in the feed
        var message = '';
        if (Object.keys(config.feeds).length === 1) {
            if (this.attributes['start']) {
                message = config.welcome_message + " ";
                this.attributes['start'] = false;
            }
            message += 'Es gibt keine neuen Artikel. Magst du ältere Artikel anhören? ';
            this.emit(':ask', message, message);
        } else {
            message = this.attributes['category'] + ' hat keine neuen Artikel. Magst du ältere Artikel anhören? ';
            var reprompt = 'Es gibt keine neuen Artikel in dieser Kategorie. ' +
                'Du kannst ja sagen um ältere Artikel anzuhören und nein um andere Kategorien auszuwählen.';
            // change state to NO_NEW_ITEM
            this.handler.state = constants.states.NO_NEW_ITEM;
            this.emit(':ask', message, reprompt);
        }
    },
    'readPagedItems' : function (items) {
        // Read items to the user
        var category = this.attributes['category'];

        var message = '';
        var reprompt = '';
        var cardTitle = category;
        var cardContent = '';
        var content = '';

        var feedEndedKey = 'feedEnded' + category;
        var justStartedKey = 'justStarted' + category;

        // change state to FEED_MODE
        this.handler.state = constants.states.FEED_MODE;
        // add message to notify number of new items in the feed
        if (this.attributes['newItemCount'] && this.attributes['newItemCount'] > 0) {
            var msg;
            if (this.attributes['newItemCount'] == 1) {
                msg = ' neuen Artikel. ';
            } else {
                msg = ' neue Artikel. ';
            }
            cardContent = this.attributes['category'] + ' hat ' + this.attributes['newItemCount'] + msg + '\n';
            message = this.attributes['category'] + ' hat ' + this.attributes['newItemCount'] + msg +
                constants.breakTime['200'];
            this.attributes['newItemCount'] = null;
        }

        items.forEach(function (feed) {
            content += config.speech_style_for_numbering_feeds + " " + (feed.count + 1) + ". " + feed.title + ". ";
            cardContent += config.speech_style_for_numbering_feeds + " " + (feed.count + 1) + ". " + feed.title;
            // If config flag set to display description, append description
            if (!config.display_only_title_in_card) {
                cardContent += "  -  ";
                cardContent += feed.description;
            }
            if (!config.speak_only_feed_title) {
                content += constants.breakTime['300'];
                content += feed.description + " ";
            }
            cardContent += '\n';
            content += constants.breakTime['500'];
        });
        message += content;
        if (this.attributes[feedEndedKey]) {
            message += ' Du hast das Ende der Kategorie erreicht. ' + constants.breakTime['200'] +
                ' Du kannst eine andere Kategorie auswählen, oder diese Kategorie von vorne beginnen. ';
            cardContent += 'Du hast das Ende der Kategorie erreicht. ' +
                'Du kannst eine andere Kategorie auswählen, oder diese Kategorie von vorne beginnen. ';
            reprompt = ' Du kannst entweder sagen, liste alle Kategorien auf, um alle Kategorien anzuhören, oder' +
                ' sage neustart, um die aktuelle Kategorie von vorne zu beginnen. ';
        } else if (this.attributes[justStartedKey]) {
            message += 'Du kannst mehr sagen um mehr Artikel zu erhalten.';
            cardContent += 'Du kannst mehr sagen um mehr Artikel zu erhalten.';
            reprompt = 'Du kannst mehr sagen, um mehr Elemente zu erhalten. Du kannst auch sagen, liste alle Kategorien auf, um alle Kategorien anzuhören. ';
        } else {
            message += 'Du kannst mehr sagen um mehr Artikel zu erhalten. ';
            cardContent += 'Du kannst mehr sagen um mehr Artikel zu erhalten. ';
            reprompt = 'Du kannst mehr sagen, um mehr Artikel zu erhalten, oder vorherige um vorherige Artiekl zu erhalten. ' +
                'Du kannst auch sagen, liste alle Kategorien auf, um alle Kategorien anzuhören. ';
        }
        this.emit(':askWithCard', message, reprompt, cardTitle, cardContent, null);
    },
    'readPagedItemsSingleMode' : function (items) {
        // Read items to the user
        var category = this.attributes['category'];

        var message = '';
        var cardTitle = 'Artikel';
        var cardContent = '';
        var content = '';

        var feedEndedKey = 'feedEnded' + category;
        // add message to notify number of new items in the feed
        if (this.attributes['newItemCount']) {
            message += config.welcome_message + constants.breakTime['100'];
            if (this.attributes['newItemCount'] > 0) {
                var msg;
                if (this.attributes['newItemCount'] == 1) {
                    msg = ' neuen Artikel. ';
                } else {
                    msg = ' neue Artikel. ';
                }
                cardContent = 'Es gibt ' + this.attributes['newItemCount'] + msg + '\n';
                message += this.attributes['category'] + ' hat ' + this.attributes['newItemCount'] + msg +
                    constants.breakTime['200'];
            } else {
                message += 'Es gibt' + this.attributes['feedLength'] + ' Artikel in dieser Kategorie. ';
            }
            this.attributes['newItemCount'] = null;
            // Setting start flag as false
            if (this.attributes['start']) {
                this.attributes['start'] = false;
            }
        }

        items.forEach(function (feed) {
            content += config.speech_style_for_numbering_feeds + " " + (feed.count + 1) + ". " + feed.title + ". ";
            cardContent += config.speech_style_for_numbering_feeds + " " + (feed.count + 1) + ". " + feed.title;
            // If config flag set to display description, append description
            if (!config.display_only_title_in_card) {
                cardContent += "  -  ";
                cardContent += feed.description;
            }
            if (!config.speak_only_feed_title) {
                content += constants.breakTime['300'];
                content += feed.description + " ";
            }
            cardContent += '\n';
            content += constants.breakTime['500'];
        });
        message += content;
        if (this.attributes[feedEndedKey]) {
            message += ' Du hast das Ende der Kategorie erreicht. ' + constants.breakTime['200'] +
                ' Du kannst Neustart sagen, um diese Kategorie von Beginn an anzuhören oder du kannst vorherige sagen, um neuere Artikel anzuhören. ';
            cardContent += 'Du hast das Ende der Kategorie erreicht. ' +
                ' Du kannst Neustart sagen, um diese Kategorie von Beginn an anzuhören oder du kannst vorherige sagen, um neuere Artikel anzuhören. ';
            return this.emit(':askWithCard', message, message, cardTitle, cardContent, null);
        } else {
            message += 'Du kannst mehr sagen um mehr Artikel zu erhalten. ';
            cardContent += 'Du kannst mehr sagen um mehr Artikel zu erhalten. ';
        }
        this.emit(':askWithCard', message, message, cardTitle, cardContent, null);
    },
    'feedEmptyError' : function () {
        // Output sorry message when requested feed has no items
        var message = 'Entschuldige bitte, diese Kategorie ist leer, bitte wähle eine andere Kategorie aus.';
        var reprompt = 'Entschuldige bitte, diese Kategorie ist leer, bitte wähle eine andere Kategorie aus.';
        this.emit(':ask', message, reprompt);
    },
    'justStarted' : function () {
        // Outputs message when user says previous when already at start of feed
        var message = 'Entschuldige bitte, du bist am Anfang der Kategorie. ' +
            'Du kannst weiter sagen, um nachfolgende Artikel anzuhören oder du kannst liste die Kategorien auf sagen, um andere Kategorien auszuwählen.';
        var reprompt = 'Du kannst weiter sagen, um nachfolgende Artikel anzuhören oder ' +
            'du kannst liste die Kategorien auf sagen, um andere Kategorien auszuwählen.';
        this.emit(':ask', message, reprompt);
    },
    'alreadyEnded' : function () {
        // Outputs message when user says next when already at end of feed
        var message = 'Entschuldige bitte, du hast das Ende dieser Kategorie erreicht. ' +
            'Du kannst liste die Kategorien auf sagen, um andere Kategorien auszuwählen oder du kannst vorherige sagen, um vorherige Kategorien anzuhören.';
        var reprompt = 'Du kannst liste die Kategorien auf sagen, um andere Kategorien auszuwählen oder ' +
            'du kannst vorherige sagen, um vorherige Kategorien anzuhören.';
        this.emit(':ask', message, reprompt);
    },
    'helpStartMode' : function () {
        // Outputs helps message when in START MODE
        var message = config.welcome_message + constants.breakTime['100'] +
            'Um eine Kategorie anzuhören, kannst du eine Kategorie auswählen, indem du ihren Namen oder ihre Nummer benutzt ' +
            constants.breakTime['100'] +
            'Du kannst auch eine oder mehr Kategorien als Favorit markieren ' +
            ' und dann Alexa fragen, öffne meine Favoriten, um diese Kategorien anzuhören. ' +
            constants.breakTime['100'] +
            'Um eine Kategorie zu deine Favoriten hinzuzufügen, kannst du sagen, füge Job zu den Favoriten hinzu.' +
            constants.breakTime['100'] +
            'Dies sind die verfügbaren Kategorien : ' +
            constants.breakTime['100'];
        // Call category helper to get list of all categories
        categoryHelper((categoryList) => {
            message += categoryList;
            this.emit(':ask', message, message);
        });
    },
    'helpFeedMode' : function () {
        // Outputs helps message when in FEED MODE
        var category = this.attributes['category'];
        var message = 'Du hörst dir gerade ' + category + 'an. ' +
            constants.breakTime['100'] +
            'Du kannst vor oder zurück sagen um durch die Kategorie zu navigieren. ' +
            constants.breakTime['100'] +
            ' Um alle Kategorien anzuhören kannst du sagen, gib mir die Liste der Kategorien.' +
            constants.breakTime['100'] +
            ' Und sage Neustart um die aktuelle Kategorie von vorne zu beginnen. ' +
            constants.breakTime['100'] +
            'Du kannst auch sagen, gib mir Details zu Artikel 1 um mehr Informationen zu diesem Artikel zu bekommen. ' +
            constants.breakTime['100'] +
            'Was möchtest du tun?';
        this.emit(':ask', message, message);
    },
    'helpNoNewItemMode' : function () {
        // Outputs helps message when in NO NEW ITEM MODE
        var message = this.attributes['category'] + ' hat keine neuen Artikel. ' +
            'Du kannst ja sagen um ältere Artikel anzuhören und nein um andere Kategorien auszuwählen.'
            + constants.breakTime['100'] +
            'Was möchtest du tun?';
        this.emit(':ask', message, message);
    },
    'helpSingleFeedMode' : function () {
        var message = config.welcome_message + 'Um durch die Kategorie zu navigieren kannst du Befehle wie vor oder zurück benutzen.';
        this.emit(':ask', message, message);
    },
    'readItemSpeechHelper' : function () {
        // Output sorry message to user. Metrics created using cloudwatch logs to see how many users requests are made
        var message = 'Entschuldige bitte, diese Funktion ist nicht verfügbar.'
            + constants.breakTime['250'] +
            'Du kannst mit der Navigation durch die Kategorie fortfahren, indem du weiter sagst.';
        this.emit(':ask', message, message);
    },
    'sendItemSpeechHelper' : function () {
        // Output sorry message to user. Metrics created using cloudwatch logs to see how many users requests are made
        var message = 'Entschuldige bitte, diese Funktion ist nicht verfügbar.'
            + constants.breakTime['250'] +
            'Du kannst mit der Navigation durch die Kategorie fortfahren, indem du weiter sagst.';
        this.emit(':ask', message, message);
    },
    'itemInfoError' : function () {
        // Handle itemInfo request when not in feed mode
        var message = 'Entschuldige bitte, du musst eine Kategorie auswählen, bevor du Details zu einem Artikel erfragen kannst. ' +
            'Was möchtest du dir anhören?';
        var reprompt = 'Du kannst eine Kategorie auswählen, indem du ihren Namen oder ihre Nummer nennst' +
            constants.breakTime['100'] + 'Dies sind die verfügbaren Kategorien : ' +
            constants.breakTime['100'];
        // Call category helper to get list of all categories
        categoryHelper((categoryList) => {
            reprompt += categoryList;
            this.emit(':ask', message, reprompt);
        });
        this.emit(':ask', message, reprompt);
    },
    'sendItemError' : function () {
        // Handle sendItem request when not in feed mode
        var message = 'Entschuldige bitte, du musst eine Kategorie auswählen, bevor du Details zu einem Artikel erfragen kannst. ' +
            'Was möchtest du dir anhören?';
        var reprompt = 'Du kannst eine Kategorie auswählen, indem du ihren Namen oder ihre Nummer nennst' +
            constants.breakTime['100'] + 'Dies sind die verfügbaren Kategorien : ' +
            constants.breakTime['100'];
        // Call category helper to get list of all categories
        categoryHelper((categoryList) => {
            reprompt += categoryList;
            this.emit(':ask', message, reprompt);
        });
        this.emit(':ask', message, reprompt);
    },
    'unhandledStartMode' : function () {
        // Help user with possible options in _FEED_MODE
        var message = 'Entschuldige bitte, um eine Kategorie anzuhören, kannst du eine Kategorie auswählen, indem du ihren Namen oder ihre Nummer benutzt ' +
            constants.breakTime['100'] +
            'Dies sind die verfügbaren Kategorien : ' +
            constants.breakTime['100'];
        // Call category helper to get list of all categories
        categoryHelper((categoryList) => {
            message += categoryList;
            this.emit(':ask', message, message);
        });
    },
    'unhandledFeedMode' : function () {
        // Help user with possible options in _FEED_MODE
        var message = 'Entschuldige bitte, du kannst vor oder zurück sagen um durch die Kategorie zu navigieren. ' +
            constants.breakTime['100'] +
            ' Um alle Kategorien anzuhören kannst du sagen, gib mir die Liste der Kategorien.' +
            constants.breakTime['100'] +
            ' Und sage Neustart um die aktuelle Kategorie von vorne zu beginnen. ' +
            constants.breakTime['100'] +
            'You can also ask, give details for item one to get more information about the item. ' +
            constants.breakTime['100'] +
            'Was möchtest du tun?';
        this.emit(':ask', message, message);
    },
    'unhandledNoNewItemMode' : function () {
        // Help user with possible options in _NO_NEW_ITEM_MODE
        var message = 'Entschuldige bitte, du kannst ja sagen um ältere Artikel anzuhören und nein um andere Kategorien auszuwählen.';
        var reprompt = this.attributes['category'] + ' hat keine neuen Artikel. ' +
            'Du kannst ja sagen um ältere Artikel anzuhören und nein um andere Kategorien auszuwählen.'
            + constants.breakTime['100'] +
            'Was möchtest du tun?';
        this.emit(':ask', message, reprompt);
    },
    'unhandledSingleFeedMode' : function () {
        var message = 'Entschuldige bitte, du kannst weiter oder zurück sagen um durch die Kategorie zu navigieren. Was möchtest du tun?';
        this.emit(':ask', message, message);
    },
    'reportError' : function () {
        // Output error message and close the session
        var message = 'Entschuldige bitte, momentan gibt es technische Probleme beim abrufen der angefragten Informationen. Versuch es später bitte noch einmal.';
        this.emit('EndSession', message);
    }
};

function categoryHelper(callback) {
    // Generate a list of categories to serve several functions
    var categories = Object.keys(config.feeds);
    var categoryList = '';
    var cardCategoryList = '';
    var index = 0;
    categories.forEach(function (category) {
        categoryList += (++index) + constants.breakTime['100'] + category + constants.breakTime['200'];
        cardCategoryList += (index) + ') ' + category + ' \n';
    });
    categoryList += '. Welche möchtest du hören?';
    cardCategoryList += 'Welche möchtest du hören?';
    callback(categoryList, cardCategoryList);
}

module.exports = speechHandlers;
