(function ($) {

  Drupal.behaviors.facetapi = {
    attach: function(context, settings) {
      // Iterates over facet settings, applies functionality like the "Show more"
      // links for block realm facets.
      // @todo We need some sort of JS API so we don't have to make decisions
      // based on the realm.
      if (settings.facetapi) {
        for (var index in settings.facetapi.facets) {
          if (null != settings.facetapi.facets[index].makeCheckboxes) {
            Drupal.facetapi.makeCheckboxes(settings.facetapi.facets[index].id);
          }
          if (null != settings.facetapi.facets[index].limit) {
            // Applies soft limit to the list.
            Drupal.facetapi.applyLimit(settings.facetapi.facets[index]);
          }
        }
      }
    }
  };

  /**
   * Class containing functionality for Facet API.
   */
  Drupal.facetapi = {};

  /**
   * Applies the soft limit to facets in the block realm.
   */
  Drupal.facetapi.applyLimit = function(settings) {
    if (settings.limit > 0 && !$('ul#' + settings.id).hasClass('facetapi-processed')) {
      // Only process this code once per page load.
      $('ul#' + settings.id).addClass('facetapi-processed');

      // Ensures our limit is zero-based, hides facets over the limit.
      var limit = settings.limit - 1;
      $('ul#' + settings.id).find('li:gt(' + limit + ')').hide();

      // Adds "Show more" / "Show fewer" links as appropriate.
      $('ul#' + settings.id).filter(function() {
        return $(this).find('li').length > settings.limit;
      }).each(function() {
        $('<a href="#" class="facetapi-limit-link"></a>').text(settings.showMoreText).click(function() {
          if ($(this).hasClass('open')) {
            $(this).siblings().find('li:gt(' + limit + ')').slideUp();
            $(this).removeClass('open').text(settings.showMoreText);
          }
          else {
            $(this).siblings().find('li:gt(' + limit + ')').slideDown();
            $(this).addClass('open').text(Drupal.t(settings.showFewerText));
          }
          return false;
        }).insertAfter($(this));
      });
    }
  };

  /**
   * Constructor for the facetapi redirect class.
   */
  Drupal.facetapi.Redirect = function(href) {
    this.href = href;
  };

  /**
   * Method to redirect to the stored href.
   */
  Drupal.facetapi.Redirect.prototype.gotoHref = function() {
    window.location.href = this.href;
  };

  /**
   * Turns all facet links into checkboxes.
   * Ensures the facet is disabled if a link is clicked.
   */
  Drupal.facetapi.makeCheckboxes = function(facet_id) {
    var $facet = $('#' + facet_id),
        $items = $('a.facetapi-checkbox, span.facetapi-checkbox', $facet);

    // Find all checkbox facet links and give them a checkbox.
    $items.once('facetapi-makeCheckbox').each(Drupal.facetapi.makeCheckbox);
    $items.once('facetapi-disableClick').click(function (e) {
      Drupal.facetapi.disableFacet($facet);
    });
  };

  /**
   * Disable all facet links and checkboxes in the facet and apply a 'disabled'
   * class.
   */
  Drupal.facetapi.disableFacet = function ($facet) {
    var $elem = $(this);
    // Apply only for links.
    if ($elem[0].tagName == 'A') {
      $facet.addClass('facetapi-disabled');
      $('a.facetapi-checkbox').click(Drupal.facetapi.preventDefault);
      $('input.facetapi-checkbox', $facet).attr('disabled', true);
    }
  };

  /**
   * Event listener for easy prevention of event propagation.
   */
  Drupal.facetapi.preventDefault = function (e) {
    e.preventDefault();
  };

  /**
   * Replace an unclick link with a checked checkbox.
   */
  Drupal.facetapi.makeCheckbox = function() {
    var $elem = $(this),
        active = $elem.hasClass('facetapi-active');

    if (!active && !$elem.hasClass('facetapi-inactive')) {
      // Not a facet element.
      return;
    }

    // Derive an ID and label for the checkbox based on the associated link.
    // The label is required for accessibility, but it duplicates information
    // in the link itself, so it should only be shown to screen reader users.
    var id = this.id + '--checkbox',
        description = $elem.find('.element-invisible').html(),
        label = $('<label class="element-invisible" for="' + id + '">' + description + '</label>');

    // Link for elements with count 0.
    if ($elem[0].tagName == 'A') {
      var checkbox = $('<input type="checkbox" class="facetapi-checkbox" id="' + id + '" />'),
        // Get the href of the link that is this DOM object.
        href = $elem.attr('href'),
        redirect = new Drupal.facetapi.Redirect(href);
    }
    // Link for elements with count more than 0.
    else {
      var checkbox = $('<input disabled type="checkbox" class="facetapi-checkbox" id="' + id + '" />');
    }

    checkbox.click(function (e) {
      Drupal.facetapi.disableFacet($elem.parents('ul.facetapi-facetapi-checkbox-links'));
      redirect.gotoHref();
    });

    if (active) {
      checkbox.attr('checked', true);
      // Add the checkbox and label, hide the link.
      $elem.before(label).before(checkbox).hide();
    }
    else {
      $elem.before(label).before(checkbox);
    }
  };

})(jQuery);
;
(function ($) {

Drupal.behaviors.textarea = {
  attach: function (context, settings) {
    $('.form-textarea-wrapper.resizable', context).once('textarea', function () {
      var staticOffset = null;
      var textarea = $(this).addClass('resizable-textarea').find('textarea');
      var grippie = $('<div class="grippie"></div>').mousedown(startDrag);

      grippie.insertAfter(textarea);

      function startDrag(e) {
        staticOffset = textarea.height() - e.pageY;
        textarea.css('opacity', 0.25);
        $(document).mousemove(performDrag).mouseup(endDrag);
        return false;
      }

      function performDrag(e) {
        textarea.height(Math.max(32, staticOffset + e.pageY) + 'px');
        return false;
      }

      function endDrag(e) {
        $(document).unbind('mousemove', performDrag).unbind('mouseup', endDrag);
        textarea.css('opacity', 1);
      }
    });
  }
};

})(jQuery);
;
/**
 * @file
 * JavaScript behaviors for the front-end display of webforms.
 */

(function ($) {

  "use strict";

  Drupal.behaviors.webform = Drupal.behaviors.webform || {};

  Drupal.behaviors.webform.attach = function (context) {
    // Calendar datepicker behavior.
    Drupal.webform.datepicker(context);

    // Conditional logic.
    if (Drupal.settings.webform && Drupal.settings.webform.conditionals) {
      Drupal.webform.conditional(context);
    }
  };

  Drupal.webform = Drupal.webform || {};

  Drupal.webform.datepicker = function (context) {
    $('div.webform-datepicker').each(function () {
      var $webformDatepicker = $(this);
      var $calendar = $webformDatepicker.find('input.webform-calendar');

      // Ensure the page we're on actually contains a datepicker.
      if ($calendar.length == 0) {
        return;
      }

      var startDate = $calendar[0].className.replace(/.*webform-calendar-start-(\d{4}-\d{2}-\d{2}).*/, '$1').split('-');
      var endDate = $calendar[0].className.replace(/.*webform-calendar-end-(\d{4}-\d{2}-\d{2}).*/, '$1').split('-');
      var firstDay = $calendar[0].className.replace(/.*webform-calendar-day-(\d).*/, '$1');
      // Convert date strings into actual Date objects.
      startDate = new Date(startDate[0], startDate[1] - 1, startDate[2]);
      endDate = new Date(endDate[0], endDate[1] - 1, endDate[2]);

      // Ensure that start comes before end for datepicker.
      if (startDate > endDate) {
        var laterDate = startDate;
        startDate = endDate;
        endDate = laterDate;
      }

      var startYear = startDate.getFullYear();
      var endYear = endDate.getFullYear();

      // Set up the jQuery datepicker element.
      $calendar.datepicker({
        dateFormat: 'yy-mm-dd',
        yearRange: startYear + ':' + endYear,
        firstDay: parseInt(firstDay),
        minDate: startDate,
        maxDate: endDate,
        onSelect: function (dateText, inst) {
          var date = dateText.split('-');
          $webformDatepicker.find('select.year, input.year').val(+date[0]).trigger('change');
          $webformDatepicker.find('select.month').val(+date[1]).trigger('change');
          $webformDatepicker.find('select.day').val(+date[2]).trigger('change');
        },
        beforeShow: function (input, inst) {
          // Get the select list values.
          var year = $webformDatepicker.find('select.year, input.year').val();
          var month = $webformDatepicker.find('select.month').val();
          var day = $webformDatepicker.find('select.day').val();

          // If empty, default to the current year/month/day in the popup.
          var today = new Date();
          year = year ? year : today.getFullYear();
          month = month ? month : today.getMonth() + 1;
          day = day ? day : today.getDate();

          // Make sure that the default year fits in the available options.
          year = (year < startYear || year > endYear) ? startYear : year;

          // jQuery UI Datepicker will read the input field and base its date
          // off of that, even though in our case the input field is a button.
          $(input).val(year + '-' + month + '-' + day);
        }
      });

      // Prevent the calendar button from submitting the form.
      $calendar.click(function (event) {
        // This event is triggered also when pressing enter when the focus is on
        // previous webform components, but we only want to do something when
        // we are on the calendar component. By checking the event client x/y
        // position we known if it was the user clicking. For keyboard navigators
        // simply the focus handles the date picker so we don't have to do
        // anything special for them.
        if (event.clientX !== 0 && event.clientY !== 0) {
          // Focus is only necessary for Safari. But it has no impact on other
          // browsers.
          $(this).focus();
          event.preventDefault();
        }
      });

      // Clear date on backspace or delete.
      $calendar.keyup(function (e) {
        if (e.keyCode == 8 || e.keyCode == 46) {
          $.datepicker._clearDate(this);
        }
      });
    });
  };

  Drupal.webform.conditional = function (context) {
    // Add the bindings to each webform on the page.
    $.each(Drupal.settings.webform.conditionals, function (formKey, settings) {
      var $form = $('.' + formKey + ':not(.webform-conditional-processed)');
      $form.each(function (index, currentForm) {
        var $currentForm = $(currentForm);
        $currentForm.addClass('webform-conditional-processed');
        $currentForm.bind('change', {'settings': settings}, Drupal.webform.conditionalCheck);

        // Trigger all the elements that cause conditionals on this form.
        Drupal.webform.doConditions($currentForm, settings);
      });
    });
  };

  /**
   * Event handler to respond to field changes in a form.
   *
   * This event is bound to the entire form, not individual fields.
   */
  Drupal.webform.conditionalCheck = function (e) {
    var $triggerElement = $(e.target).closest('.webform-component');
    if (!$triggerElement.length) {
      return;
    }
    var $form = $triggerElement.closest('form');
    var triggerElementKey = $triggerElement.attr('class').match(/webform-component--[^ ]+/)[0];
    var settings = e.data.settings;
    if (settings.sourceMap[triggerElementKey]) {
      Drupal.webform.doConditions($form, settings);
    }
  };

  /**
   * Processes all conditional.
   */
  Drupal.webform.doConditions = function ($form, settings) {

    var stackPointer;
    var resultStack;

    /**
     * Initializes an execution stack for a conditional group's rules.
     *
     * Also initializes sub-conditional rules.
     */
    function executionStackInitialize(andor) {
      stackPointer = -1;
      resultStack = [];
      executionStackPush(andor);
    }

    /**
     * Starts a new subconditional for the given and/or operator.
     */
    function executionStackPush(andor) {
      resultStack[++stackPointer] = {
        results: [],
        andor: andor,
      };
    }

    /**
     * Adds a rule's result to the current sub-conditional.
     */
    function executionStackAccumulate(result) {
      resultStack[stackPointer]['results'].push(result);
    }

    /**
     * Finishes a sub-conditional and adds the result to the parent stack frame.
     */
    function executionStackPop() {
      // Calculate the and/or result.
      var stackFrame = resultStack[stackPointer];
      // Pop stack and protect against stack underflow.
      stackPointer = Math.max(0, stackPointer - 1);
      var $conditionalResults = stackFrame['results'];
      var filteredResults = $.map($conditionalResults, function (val) {
        return val ? val : null;
      });
      return stackFrame['andor'] === 'or'
                ? filteredResults.length > 0
                : filteredResults.length === $conditionalResults.length;
    }

    // Track what has been set/hidden for each target component's elements.
    // Hidden elements must be disabled because if they are required and don't
    // have a value, they will prevent submission due to html5 validation.
    // Each execution of the conditionals adds a temporary class
    // webform-disabled-flag so that elements hidden or set can be disabled and
    // also be prevented from being re-enabled by another conditional (such as a
    // parent fieldset). After processing conditionals, this temporary class
    // must be removed in preparation for the next execution of the
    // conditionals.
    $.each(settings.ruleGroups, function (rgid_key, rule_group) {
      var ruleGroup = settings.ruleGroups[rgid_key];

      // Perform the comparison callback and build the results for this group.
      executionStackInitialize(ruleGroup['andor']);
      $.each(ruleGroup['rules'], function (m, rule) {
        switch (rule['source_type']) {
          case 'component':
            var elementKey = rule['source'];
            var element = $form.find('.' + elementKey)[0];
            var existingValue = settings.values[elementKey] ? settings.values[elementKey] : null;
            executionStackAccumulate(window['Drupal']['webform'][rule.callback](element, existingValue, rule['value']));
            break;

          case 'conditional_start':
            executionStackPush(rule['andor']);
            break;

          case 'conditional_end':
            executionStackAccumulate(executionStackPop());
            break;
        }
      });
      var conditionalResult = executionStackPop();

      $.each(ruleGroup['actions'], function (aid, action) {
        var $target = $form.find('.' + action['target']);
        var actionResult = action['invert'] ? !conditionalResult : conditionalResult;
        switch (action['action']) {
          case 'show':
            var changed = actionResult != Drupal.webform.isVisible($target);
            if (actionResult) {
              $target.find('.webform-conditional-disabled:not(.webform-disabled-flag)')
                .removeClass('webform-conditional-disabled')
                .webformProp('disabled', false);
              $target
                .removeClass('webform-conditional-hidden')
                .show();
              $form.find('.chosen-disabled').prev().trigger('chosen:updated.chosen');
            }
            else {
              $target
                .hide()
                .addClass('webform-conditional-hidden')
                .find(':input')
                  .addClass('webform-conditional-disabled webform-disabled-flag')
                  .webformProp('disabled', true);
            }
            if (changed && $target.is('tr')) {
              Drupal.webform.restripeTable($target.closest('table').first());
            }
            break;

          case 'require':
            var $requiredSpan = $target.find('.form-required, .form-optional').first();
            if (actionResult != $requiredSpan.hasClass('form-required')) {
              var $targetInputElements = $target.find("input:text,textarea,input[type='email'],select,input:radio,input:checkbox,input:file");
              // Rather than hide the required tag, remove it so that other
              // jQuery can respond via Drupal behaviors.
              Drupal.detachBehaviors($requiredSpan);
              $targetInputElements
                .webformProp('required', actionResult)
                .toggleClass('required', actionResult);
              if (actionResult) {
                $requiredSpan.replaceWith('<span class="form-required" title="' + Drupal.t('This field is required.') + '">*</span>');
              }
              else {
                $requiredSpan.replaceWith('<span class="form-optional"></span>');
              }
              Drupal.attachBehaviors($requiredSpan);
            }
            break;

          case 'set':
            var $texts = $target.find("input:text,textarea,input[type='email']");
            var $selects = $target.find('select,select option,input:radio,input:checkbox');
            var $markups = $target.filter('.webform-component-markup');
            if (actionResult) {
              var multiple = $.map(action['argument'].split(','), $.trim);
              $selects
                .webformVal(multiple)
                .webformProp('disabled', true)
                  .addClass('webform-disabled-flag');
              $texts
                .val([action['argument']])
                .webformProp('readonly', true)
                .addClass('webform-disabled-flag');
              // A special case is made for markup. It is sanitized with
              // filter_xss_admin on the server. otherwise text() should be used
              // to avoid an XSS vulnerability. text() however would preclude
              // the use of tags like <strong> or <a>.
              $markups.html(action['argument']);
            }
            else {
              $selects.not('.webform-disabled-flag')
                .webformProp('disabled', false);
              $texts.not('.webform-disabled-flag')
                .webformProp('readonly', false);
              // Markup not set? Then restore original markup as provided in
              // the attribute data-webform-markup.
              $markups.each(function () {
                var $this = $(this);
                var original = $this.data('webform-markup');
                if (original !== undefined) {
                  $this.html(original);
                }
              });
            }
            break;
        }
      }); // End look on each action for one conditional.
    }); // End loop on each conditional.

    $form.find('.webform-disabled-flag').removeClass('webform-disabled-flag');
  };

  /**
   * Event handler to prevent propagation of events.
   *
   * Typically click for disabling radio and checkboxes.
   */
  Drupal.webform.stopEvent = function () {
    return false;
  };

  Drupal.webform.conditionalOperatorStringEqual = function (element, existingValue, ruleValue) {
    var returnValue = false;
    var currentValue = Drupal.webform.stringValue(element, existingValue);
    $.each(currentValue, function (n, value) {
      if (value.toLowerCase() === ruleValue.toLowerCase()) {
        returnValue = true;
        return false; // break.
      }
    });
    return returnValue;
  };

  Drupal.webform.conditionalOperatorStringNotEqual = function (element, existingValue, ruleValue) {
    var found = false;
    var currentValue = Drupal.webform.stringValue(element, existingValue);
    $.each(currentValue, function (n, value) {
      if (value.toLowerCase() === ruleValue.toLowerCase()) {
        found = true;
      }
    });
    return !found;
  };

  Drupal.webform.conditionalOperatorStringContains = function (element, existingValue, ruleValue) {
    var returnValue = false;
    var currentValue = Drupal.webform.stringValue(element, existingValue);
    $.each(currentValue, function (n, value) {
      if (value.toLowerCase().indexOf(ruleValue.toLowerCase()) > -1) {
        returnValue = true;
        return false; // break.
      }
    });
    return returnValue;
  };

  Drupal.webform.conditionalOperatorStringDoesNotContain = function (element, existingValue, ruleValue) {
    var found = false;
    var currentValue = Drupal.webform.stringValue(element, existingValue);
    $.each(currentValue, function (n, value) {
      if (value.toLowerCase().indexOf(ruleValue.toLowerCase()) > -1) {
        found = true;
      }
    });
    return !found;
  };

  Drupal.webform.conditionalOperatorStringBeginsWith = function (element, existingValue, ruleValue) {
    var returnValue = false;
    var currentValue = Drupal.webform.stringValue(element, existingValue);
    $.each(currentValue, function (n, value) {
      if (value.toLowerCase().indexOf(ruleValue.toLowerCase()) === 0) {
        returnValue = true;
        return false; // break.
      }
    });
    return returnValue;
  };

  Drupal.webform.conditionalOperatorStringEndsWith = function (element, existingValue, ruleValue) {
    var returnValue = false;
    var currentValue = Drupal.webform.stringValue(element, existingValue);
    $.each(currentValue, function (n, value) {
      if (value.toLowerCase().lastIndexOf(ruleValue.toLowerCase()) === value.length - ruleValue.length) {
        returnValue = true;
        return false; // break.
      }
    });
    return returnValue;
  };

  Drupal.webform.conditionalOperatorStringEmpty = function (element, existingValue, ruleValue) {
    var currentValue = Drupal.webform.stringValue(element, existingValue);
    var returnValue = true;
    $.each(currentValue, function (n, value) {
      if (value !== '') {
        returnValue = false;
        return false; // break.
      }
    });
    return returnValue;
  };

  Drupal.webform.conditionalOperatorStringNotEmpty = function (element, existingValue, ruleValue) {
    return !Drupal.webform.conditionalOperatorStringEmpty(element, existingValue, ruleValue);
  };

  Drupal.webform.conditionalOperatorSelectGreaterThan = function (element, existingValue, ruleValue) {
    var currentValue = Drupal.webform.stringValue(element, existingValue);
    return Drupal.webform.compare_select(currentValue[0], ruleValue, element) > 0;
  };

  Drupal.webform.conditionalOperatorSelectGreaterThanEqual = function (element, existingValue, ruleValue) {
    var currentValue = Drupal.webform.stringValue(element, existingValue);
    var comparison = Drupal.webform.compare_select(currentValue[0], ruleValue, element);
    return comparison > 0 || comparison === 0;
  };

  Drupal.webform.conditionalOperatorSelectLessThan = function (element, existingValue, ruleValue) {
    var currentValue = Drupal.webform.stringValue(element, existingValue);
    return Drupal.webform.compare_select(currentValue[0], ruleValue, element) < 0;
  };

  Drupal.webform.conditionalOperatorSelectLessThanEqual = function (element, existingValue, ruleValue) {
    var currentValue = Drupal.webform.stringValue(element, existingValue);
    var comparison = Drupal.webform.compare_select(currentValue[0], ruleValue, element);
    return comparison < 0 || comparison === 0;
  };

  Drupal.webform.conditionalOperatorNumericEqual = function (element, existingValue, ruleValue) {
    // See float comparison: http://php.net/manual/en/language.types.float.php
    var currentValue = Drupal.webform.stringValue(element, existingValue);
    var epsilon = 0.000001;
    // An empty string does not match any number.
    return currentValue[0] === '' ? false : (Math.abs(parseFloat(currentValue[0]) - parseFloat(ruleValue)) < epsilon);
  };

  Drupal.webform.conditionalOperatorNumericNotEqual = function (element, existingValue, ruleValue) {
    // See float comparison: http://php.net/manual/en/language.types.float.php
    var currentValue = Drupal.webform.stringValue(element, existingValue);
    var epsilon = 0.000001;
    // An empty string does not match any number.
    return currentValue[0] === '' ? true : (Math.abs(parseFloat(currentValue[0]) - parseFloat(ruleValue)) >= epsilon);
  };

  Drupal.webform.conditionalOperatorNumericGreaterThan = function (element, existingValue, ruleValue) {
    var currentValue = Drupal.webform.stringValue(element, existingValue);
    return parseFloat(currentValue[0]) > parseFloat(ruleValue);
  };

  Drupal.webform.conditionalOperatorNumericGreaterThanEqual = function (element, existingValue, ruleValue) {
    return Drupal.webform.conditionalOperatorNumericGreaterThan(element, existingValue, ruleValue) ||
           Drupal.webform.conditionalOperatorNumericEqual(element, existingValue, ruleValue);
  };

  Drupal.webform.conditionalOperatorNumericLessThan = function (element, existingValue, ruleValue) {
    var currentValue = Drupal.webform.stringValue(element, existingValue);
    return parseFloat(currentValue[0]) < parseFloat(ruleValue);
  };

  Drupal.webform.conditionalOperatorNumericLessThanEqual = function (element, existingValue, ruleValue) {
    return Drupal.webform.conditionalOperatorNumericLessThan(element, existingValue, ruleValue) ||
           Drupal.webform.conditionalOperatorNumericEqual(element, existingValue, ruleValue);
  };

  Drupal.webform.conditionalOperatorDateEqual = function (element, existingValue, ruleValue) {
    var currentValue = Drupal.webform.dateValue(element, existingValue);
    return currentValue === ruleValue;
  };

  Drupal.webform.conditionalOperatorDateNotEqual = function (element, existingValue, ruleValue) {
    return !Drupal.webform.conditionalOperatorDateEqual(element, existingValue, ruleValue);
  };

  Drupal.webform.conditionalOperatorDateBefore = function (element, existingValue, ruleValue) {
    var currentValue = Drupal.webform.dateValue(element, existingValue);
    return (currentValue !== false) && currentValue < ruleValue;
  };

  Drupal.webform.conditionalOperatorDateBeforeEqual = function (element, existingValue, ruleValue) {
    var currentValue = Drupal.webform.dateValue(element, existingValue);
    return (currentValue !== false) && (currentValue < ruleValue || currentValue === ruleValue);
  };

  Drupal.webform.conditionalOperatorDateAfter = function (element, existingValue, ruleValue) {
    var currentValue = Drupal.webform.dateValue(element, existingValue);
    return (currentValue !== false) && currentValue > ruleValue;
  };

  Drupal.webform.conditionalOperatorDateAfterEqual = function (element, existingValue, ruleValue) {
    var currentValue = Drupal.webform.dateValue(element, existingValue);
    return (currentValue !== false) && (currentValue > ruleValue || currentValue === ruleValue);
  };

  Drupal.webform.conditionalOperatorTimeEqual = function (element, existingValue, ruleValue) {
    var currentValue = Drupal.webform.timeValue(element, existingValue);
    return currentValue === ruleValue;
  };

  Drupal.webform.conditionalOperatorTimeNotEqual = function (element, existingValue, ruleValue) {
    return !Drupal.webform.conditionalOperatorTimeEqual(element, existingValue, ruleValue);
  };

  Drupal.webform.conditionalOperatorTimeBefore = function (element, existingValue, ruleValue) {
    // Date and time operators intentionally exclusive for "before".
    var currentValue = Drupal.webform.timeValue(element, existingValue);
    return (currentValue !== false) && (currentValue < ruleValue);
  };

  Drupal.webform.conditionalOperatorTimeBeforeEqual = function (element, existingValue, ruleValue) {
    // Date and time operators intentionally exclusive for "before".
    var currentValue = Drupal.webform.timeValue(element, existingValue);
    return (currentValue !== false) && (currentValue < ruleValue || currentValue === ruleValue);
  };

  Drupal.webform.conditionalOperatorTimeAfter = function (element, existingValue, ruleValue) {
    // Date and time operators intentionally inclusive for "after".
    var currentValue = Drupal.webform.timeValue(element, existingValue);
    return (currentValue !== false) && (currentValue > ruleValue);
  };

  Drupal.webform.conditionalOperatorTimeAfterEqual = function (element, existingValue, ruleValue) {
    // Date and time operators intentionally inclusive for "after".
    var currentValue = Drupal.webform.timeValue(element, existingValue);
    return (currentValue !== false) && (currentValue > ruleValue || currentValue === ruleValue);
  };

  /**
   * Utility function to compare values of a select component.
   *
   * @param string a
   *   First select option key to compare
   * @param string b
   *   Second select option key to compare
   * @param array options
   *   Associative array where the a and b are within the keys
   *
   * @return integer based upon position of $a and $b in $options
   *   -N if $a above (<) $b
   *   0 if $a = $b
   *   +N if $a is below (>) $b
   */
  Drupal.webform.compare_select = function (a, b, element) {
    var optionList = [];
    $('option,input:radio,input:checkbox', element).each(function () {
      optionList.push($(this).val());
    });
    var a_position = optionList.indexOf(a);
    var b_position = optionList.indexOf(b);
    return (a_position < 0 || b_position < 0) ? null : a_position - b_position;
  };

  /**
   * Utility to return current visibility.
   *
   * Uses actual visibility, except for hidden components which use the applied
   * disabled class.
   */
  Drupal.webform.isVisible = function ($element) {
    return $element.hasClass('webform-component-hidden')
              ? !$element.find('input').first().hasClass('webform-conditional-disabled')
              : $element.closest('.webform-conditional-hidden').length == 0;
  };

  /**
   * Function to get a string value from a select/radios/text/etc. field.
   */
  Drupal.webform.stringValue = function (element, existingValue) {
    var value = [];
    if (element) {
      var $element = $(element);
      if (Drupal.webform.isVisible($element)) {
        // Checkboxes and radios.
        $element.find('input[type=checkbox]:checked,input[type=radio]:checked').each(function () {
          value.push(this.value);
        });
        // Select lists.
        if (!value.length) {
          var selectValue = $element.find('select').val();
          if (selectValue) {
            if ($.isArray(selectValue)) {
              value = selectValue;
            }
            else {
              value.push(selectValue);
            }
          }
        }
        // Simple text fields. This check is done last so that the select list
        // in select-or-other fields comes before the "other" text field.
        if (!value.length) {
          $element.find('input:not([type=checkbox],[type=radio]),textarea').each(function () {
            value.push(this.value);
          });
        }
      }
    }
    else {
      switch ($.type(existingValue)) {
        case 'array':
          value = existingValue;
          break;

        case 'string':
          value.push(existingValue);
          break;
      }
    }
    return value;
  };

  /**
   * Utility function to calculate a second-based timestamp from a time field.
   */
  Drupal.webform.dateValue = function (element, existingValue) {
    var value = false;
    if (element) {
      var $element = $(element);
      if (Drupal.webform.isVisible($element)) {
        var day = $element.find('[name*=day]').val();
        var month = $element.find('[name*=month]').val();
        var year = $element.find('[name*=year]').val();
        // Months are 0 indexed in JavaScript.
        if (month) {
          month--;
        }
        if (year !== '' && month !== '' && day !== '') {
          value = Date.UTC(year, month, day) / 1000;
        }
      }
    }
    else {
      if ($.type(existingValue) === 'array' && existingValue.length) {
        existingValue = existingValue[0];
      }
      if ($.type(existingValue) === 'string') {
        existingValue = existingValue.split('-');
      }
      if (existingValue.length === 3) {
        value = Date.UTC(existingValue[0], existingValue[1], existingValue[2]) / 1000;
      }
    }
    return value;
  };

  /**
   * Utility function to calculate a millisecond timestamp from a time field.
   */
  Drupal.webform.timeValue = function (element, existingValue) {
    var value = false;
    if (element) {
      var $element = $(element);
      if (Drupal.webform.isVisible($element)) {
        var hour = $element.find('[name*=hour]').val();
        var minute = $element.find('[name*=minute]').val();
        var ampm = $element.find('[name*=ampm]:checked').val();

        // Convert to integers if set.
        hour = (hour === '') ? hour : parseInt(hour);
        minute = (minute === '') ? minute : parseInt(minute);

        if (hour !== '') {
          hour = (hour < 12 && ampm == 'pm') ? hour + 12 : hour;
          hour = (hour === 12 && ampm == 'am') ? 0 : hour;
        }
        if (hour !== '' && minute !== '') {
          value = Date.UTC(1970, 0, 1, hour, minute) / 1000;
        }
      }
    }
    else {
      if ($.type(existingValue) === 'array' && existingValue.length) {
        existingValue = existingValue[0];
      }
      if ($.type(existingValue) === 'string') {
        existingValue = existingValue.split(':');
      }
      if (existingValue.length >= 2) {
        value = Date.UTC(1970, 0, 1, existingValue[0], existingValue[1]) / 1000;
      }
    }
    return value;
  };

  /**
   * Make a prop shim for jQuery < 1.9.
   */
  $.fn.webformProp = $.fn.webformProp || function (name, value) {
    if (value) {
      return $.fn.prop ? this.prop(name, true) : this.attr(name, true);
    }
    else {
      return $.fn.prop ? this.prop(name, false) : this.removeAttr(name);
    }
  };

  /**
   * Make a multi-valued val() function.
   *
   * This is for setting checkboxes, radios, and select elements.
   */
  $.fn.webformVal = function (values) {
    this.each(function () {
      var $this = $(this);
      var value = $this.val();
      var on = $.inArray($this.val(), values) != -1;
      if (this.nodeName == 'OPTION') {
        $this.webformProp('selected', on ? value : false);
      }
      else {
        $this.val(on ? [value] : false);
      }
    });
    return this;
  };

  /**
   * Given a table's DOM element, restripe the odd/even classes.
   */
  Drupal.webform.restripeTable = function (table) {
    // :even and :odd are reversed because jQuery counts from 0 and
    // we count from 1, so we're out of sync.
    // Match immediate children of the parent element to allow nesting.
    $('> tbody > tr, > tr', table)
      .filter(':visible:odd').filter('.odd')
        .removeClass('odd').addClass('even')
      .end().end()
      .filter(':visible:even').filter('.even')
        .removeClass('even').addClass('odd');
  };

})(jQuery);
;
!function(e,t,a,n,r){if(Array.prototype.indexOf){e[n]=e[n]||[],e[n].push({"gtm.start":(new Date).getTime(),event:"gtm.js"});var g=t.getElementsByTagName(a)[0],m=t.createElement(a);m.async=!0,m.src="https://www.googletagmanager.com/gtm.js?id=GTM-N4ZZ787",g.parentNode.insertBefore(m,g)}}(window,document,"script","dataLayer");;
