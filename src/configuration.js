'use strict';

var config = {
    // TODO Add Application ID
    appId : '',
    // TODO Add an appropriate welcome message.
    welcome_message : 'Herzlich Willkommen auf Gestern Nacht im Taxi. Hier erzähle ich viele Dinge, die ich in meinem Alltag als Taxifahrer in Berlin so erlebe.',

    number_feeds_per_prompt : 3,
    speak_only_feed_title : true,
    display_only_title_in_card : true,

    // TODO Add the category name (to feed name) and the corresponding URL
    feeds : {
        'Der Job' : 'http://gestern-nacht-im-taxi.de/wordpress/category/job/feed',
        'Der Verkehr' : 'http://gestern-nacht-im-taxi.de/wordpress/category/verkehr/feed',
        'Die Fahrgäste' : 'http://gestern-nacht-im-taxi.de/wordpress/category/fahrgast/feed'

    },

    speech_style_for_numbering_feeds : 'Artikel',

    // TODO Add the s3 Bucket Name, dynamoDB Table Name and Region
    s3BucketName : 'get-newest-gnit-articles-bucket',
    dynamoDBTableName : 'getNewestGNITArticlesTable',
    dynamoDBRegion : 'eu-west-1'
};

module.exports = config;
