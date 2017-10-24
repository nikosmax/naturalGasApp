var paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'Ab8NnVTOnESuAf6IKF7x8roKNKw-SWaTK2wUAmJpbOYhXcwu2dXumgYjJxGIt0dMvVpo0CgOYLMG_o1i',
    'client_secret': 'EImQg-JFfZ1ZVraLhxNEJJbK6SjLaGpIB_7LjusgFBAy1OvNW13Dc3QzqwAMo0ZGwzK8eqzAk1hiXQ5-'
});

module.exports=paypal;