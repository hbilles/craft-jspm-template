// --------------------------------------------------------------------
// set placeholders
//
// polyfill for older browsers

import 'jquery';
import '../vendor/jquery.placeholder';


$('.hideLabels li label, .hideLabels p label, .hide-label label, #contact-form .select label').addClass('visuallyhidden');
$('input, textarea').placeholder();
