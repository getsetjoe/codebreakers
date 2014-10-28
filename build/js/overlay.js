var overlay,		
  closeBtns = $( 'button.overlay-close' ),
  transEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'msTransition': 'MSTransitionEnd',
    'transition': 'transitionend'
  },
  //transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
  support = true; //{ transitions : Modernizr.csstransitions };

function toggleOverlay(selector) {
  if (selector) overlay = document.querySelector(selector);
  if( $(overlay).hasClass('open') ) {
    $(overlay).removeClass('open').addClass('close');
    var onEndTransitionFn = function( ev ) {
      if( support.transitions ) {
        if( ev.propertyName !== 'visibility' ) return;
        this.removeEventListener( transEndEventName, onEndTransitionFn );
      }
      $(overlay).removeClass('close');
    };
    if( support.transitions ) {
      overlay.addEventListener( transEndEventName, onEndTransitionFn );
    }
    else {
      onEndTransitionFn();
    }
  }
  else if( !$(overlay).hasClass('close') ) {
    $(overlay).addClass('open');
  }
}

closeBtns.on( 'click', function() {
  toggleOverlay();
} );