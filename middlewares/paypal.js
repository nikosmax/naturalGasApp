var paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AbDOkt2qwZ_CvoVZSiNe20WD-bdZgKCKGBgBmyJJQGbUgXidWZoTs4PEG8W9rBe9ow5ivxgt_-bbbUMB',
    'client_secret': 'ELaFW07VG5lKMzQc8FrU5WfPBSM98sUrRWudEOM4yDP-zrcFPp-IkeABsLKtMj3Y_vccYszfKsBNvO0r'
});

module.exports=paypal;