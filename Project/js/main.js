$(document).ready(function(){	
	$.ajaxSetup({
	    headers: {
	        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
	    }
	}); 


	// Window size
	const width = $(window).width();

	// Scroll to element
	const scrollToElement = function(el = false){
	    
	    if(typeof $('.has-error').first().offset() !== 'undefined') {

	        if($('.has-error').parents('#colorbox_content').length) {
	            $.colorbox.resize();
	        }

	        var scrollOffset = $('.has-error').first().offset().top-200;

	        $('html, body').animate({
	            scrollTop: scrollOffset
	        }, 400);

	    } else {
	        if(el.length) {
	            var scrollOffset = el.first().offset().top-200;

	            $('html, body').animate({
	                scrollTop: scrollOffset
	            }, 400);
	        }
	    }
	}

	$(document).on('change','.file-input', function() {
		var t = this;
		setTimeout(function(){
			if($('.change-account-img').hasClass('has-success')) {
				readURL(t);
			}
		},300)
    })

	function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('.img-file')
                    .attr('src', e.target.result);
            };

            reader.readAsDataURL(input.files[0]);
        }
    }

	$(document).on('click','.links-btn', function() {
    	$('.form-action-type').val( $(this).attr('data-action') )
    })

	// Scroll to element when form submit with errors
	// $('form').on('afterValidate', function (event, messages) {
	//     scrollToElement();
	// });

	// Ajax Request
	const sendAjax = function(url,data,type='POST',data_type='json',handleSuccessFunc)
	{
	    var ajaxPromise = new Promise(function(resolve,reject){
	        $.ajax({
	            url: url,
	            type: type,
	            data: data,
	            dataType: data_type,
	            success: function(data) {
	                resolve(data);
	            },
	            error: function(error) {
	                reject(error);
	            }
	        });
	    });

	    return ajaxPromise;
	}


	// Redirect page to selected url on selectbox changes	
	$(document).on('change','.redirect-select',function(){
        window.top.location = $(this).val();
    })

    const calculateTariff = function() {
	    var country_el = $('.country-tabs .is-tab-active');
	    var currency_rate = country_el.attr('data-currency-rate')
	    var tariff_list = $.parseJSON(country_el.attr('data-price'));

	    var weight_type   	= $('.calc-weight-type').attr('data-type');
	    var actual_weight   = parseFloat( $('.calc-weight').val() );
	    var actual_weight   = !isNaN(actual_weight)  ? actual_weight : 0;
	    var width           = parseFloat( $('.calc-width').val() )
	    var height          = parseFloat( $('.calc-height').val() )
	    var length          = parseFloat( $('.calc-length').val() )
	    var volume_weight   = 0;
	    var currency        = country_el.attr('data-currency');
	    var parcel_type		= $('.parcel-type.is-tab-active').attr('data-type')

	    if($('.calc-width-type').val() == 'm') {
	    	width *=100;
	    }

	    if($('.calc-length-type').val() == 'm') {
	    	length *=100;
	    }

	    if($('.calc-height-type').val() == 'm') {
	    	height *=100;
	    }

	    console.log(width,length,height)

	    if(actual_weight > 1000000) {
	    	return false;
	    }

	    if(weight_type == 'gr') {
	    	actual_weight = actual_weight/1000;
	    }

	    if(!isNaN(width) && !isNaN(height) && !isNaN(length)) 
	    {
	        volume_weight =  (width * height * length / 6000) ;
	    }

	    if(( width >= 50 || height >= 50 || length >= 50 ) && volume_weight > actual_weight) {
	        actual_weight = volume_weight;
	    } else if( country_el.val() == 3  && ( ( volume_weight - actual_weight )  >=15 ) ) {
	        actual_weight = volume_weight;
	    }


	    var options = {
	        useEasing: false,
	        useGrouping: true,
	        separator: '', 
	        decimal: '.', 
	    };
	    

	    var service_fee = 0;

	    if($('.service-item:checked')) {
	    	$.each($('.service-item:checked'),function() {
	    		service_fee += parseFloat($(this).attr('data-price'))
	    	})
	    }

	    tariff_list.forEach(function(tariff) {

	        if(actual_weight !=0 && actual_weight >= tariff.from_weight && actual_weight <= tariff.to_weight)
	        {
	            if(parseFloat(tariff.discounted_price) > 0 && parcel_type != 'liquid') {
	                var t_price = tariff.discounted_price
	            } else {
	                var t_price = parcel_type === 'liquid' ? tariff.liquid_price : tariff.price
	            }

	            if(tariff.to_weight > 1) {
	                t_price = t_price * actual_weight;
	            }

	            t_price +=service_fee;

	            var countUp = new CountUp('calc-total', 0, t_price, 2, 0.3, options);
	            var countUpConverted = new CountUp('calc-total-converted', 0, t_price * currency_rate, 2, 0.3, options);
		        countUp.start();
		        countUpConverted.start();
	            return false;

	        } else if(actual_weight !=0 && actual_weight >= tariff.from_weight && tariff.to_weight == 0) {
	            
	            if(parseFloat(tariff.discounted_price) > 0 && parcel_type != 'liquid') {
	                var t_price = tariff.discounted_price
	            } else {
	                var t_price = parcel_type === 'liquid' ? tariff.liquid_price : tariff.price
	            }

	            var w_price = actual_weight*t_price;

	            w_price +=service_fee;

				var countUp = new CountUp('calc-total', 0, w_price, 2, 0.3, options);
				var countUpConverted = new CountUp('calc-total-converted', 0, w_price * currency_rate, 2, 0.3, options);
		        countUp.start();
		        countUpConverted.start();
	            return false;
	        }

	    })
	}

	$(document).on('click','.btn-calculate', function() {
	    calculateTariff(); 
	})

	$(document).on('change','.service-item', function() {
	    calculateTariff(); 
	})

	// Submit custom form
	$(document).on('beforeSubmit','.custom-form form', function(event, jqXHR, settings) 
	{
	    var form = $(this);
	    if(form.find('.has-error').length > 0)
	    	return false;

	    $.ajax({
	        url: form.attr('action'),
	        type: 'POST',
	        data: new FormData(this),
	        contentType: false,
	        cache: false,
	        processData:false,
	        dataType: 'json',
	        success: function(data) {

	        	if($('#signupform-recaptcha').length) {
                    $('#signupform-recaptcha').val('')
                    grecaptcha.reset();
                }

	        	if(data.success && data.redirect !==undefined) {
	        		window.top.location = data.redirect;
	        		return false;
	        	}

	        	if(data.confirmation !== undefined) {
	        		var modal = $('#sms-verification');
					modal.iziModal();
					modal.iziModal('open');
					return false;
	        	}

	        	if(!data.success && data.payment_form  != undefined) {
            		var modal = $('#order-payment');
					modal.find('.modal-body').html(data.payment_form)
					modal.modal('show')
					return false;
            	}

	        	if(data.chat !==undefined) {
	        		$('#ticket-window .modal-body').html(data.chat)
	        		return false;
	        	}

	        	var type = data.success ? 'success' : 'error';
	            showNotification(data.response, type);
	            if(form.hasClass('form-reset') && data.success) {
	            	form[0].reset()
	            }


	            return false;
	        }
	    });

	    return false;
	});


	// show notification
	const showNotification = function(message,type, title = false) {
		var modal = $('#' + type + 'Modal');

		if(title) {
			modal.find('.modal-title').html(title)
		}

		modal.find('.modal-description').html(message)
		modal.modal('show')
	}

	// Get header basket count
	const getCartCount = function() 
	{
	    var ajaxPromise = sendAjax('/links/get-basket-count',{},'GET');

	    ajaxPromise.then(function(data)
	    {
	       if(data.success) 
	       {
	       		if(parseInt(data.response)) {
	       			$('.cart-count').html(data.response).removeClass('d-none')
	       		} else {
	       			$('.cart-count').addClass('d-none')
	       		}
	       }
	            
	    },showNotification)
	}

	if($('.logged-user').length) 
	{
		getCartCount();
	}

	$(document).on('click','.add-new-product', function(){
		var product_form = $('.product-list__item:first').clone()
		product_form.find('input').val('')
		product_form.find('.product-count').val(1)
		product_form.find('.product-note,.product-color,.product-size').val('')
		product_form.find('.total-price').val('0 TL')
		$('.product-list').append(product_form)

		if($('.product-list__item').length > 1) {
			$('.remove-product').removeClass('d-none')
		}

		resetProductCount();

		return false;
	})

	const resetProductCount = function() {
		$('.product-list__item').each(function(i,el) {
			$(el).find('.product-num').html(i + 1)
		})
	}

	// Control product form delete btn
	$(document).on('click','.remove-product', function(){
		if($('.product-list__item').length > 1) {
			$(this).parents('.product-list__item').remove()
		}
		if($('.product-list__item').length == 1) {
			$('.remove-product').addClass('d-none')
		}

		resetProductCount();

		return false;
	})

	$(document).on('keyup','.product-link', function()
	{
	    var p = $(this).parents('.product-list__item');

	    var ajaxPromise = sendAjax('/links/fetch-url',{'url': $(this).val()},'GET');

	    ajaxPromise.then(function(data)
	    {
	        if(data.success) {
	            p.find('.product-price').val(data.response.price)
	            p.find('.product-note').val(data.response.category)
	            calculateLinksPrice();
	        }
	    })
	})

	const calculateLinksPrice = function() {
	    var form        = $('.custom-form form');
	    var percent     = parseFloat( form.attr('data-percent') )
	    var currency    = form.attr('data-currency')
	    var total_price = 0;
	    var total_product_count = 0;

	    $('.product-list__item').each(function(i,t) {
	        var product_price 	= parseFloat( $(t).find('.product-price').val());
	        var product_count 	= parseInt( $(t).find('.product-count').val()) ;
	        var cargo_price 	= parseFloat( $(t).find('.cargo-price').val()) ;
	        cargo_price 		= isNaN(cargo_price) ? 0 : cargo_price;

	        total_product_count += product_count;

	        if(!isNaN(product_price) && !isNaN(product_count))
	        {
	            var product_price = product_price * product_count + cargo_price;

	            var p_total = product_price + product_price * percent / 100;

	            $(t).find('.total-link-price').html(p_total.toFixed(2))
	            total_price += product_price;
	        }
	    })	

	    var comission = total_price * percent / 100;
	    // $('.subtotal-amount').html( total_price.toFixed(2))
	    // $('.comission-amount').html( comission.toFixed(2) )
	    $('.total-amount').html( (total_price + comission).toFixed(2) )
	    // $('.total-product-count').html( total_product_count )
	}

	$(document).on('change', '.product-price,.product-count,.cargo-price', function(){
	    calculateLinksPrice()
	})

	$(document).on('click', '.quantity-icon', function(){
	    calculateLinksPrice()
	})

	const calculateBasketPrice = function() {

		if(!$('.basket-item').length) {
			$('.card').remove();
			return false;
		}

		var total_price = 0;
		var comission = 0;

		$('.basket-item:checked').each(function() {
			total_price += parseFloat( $(this).attr('data-price') );
			comission += parseFloat( $(this).attr('data-comission') )
		})

		$('.total-payable-amount').html(total_price.toFixed(2))
	}

	// Delete item
	$(document).on('click','.btn-trash', function() 
	{
	    var t = $(this);

	    if(!confirm(t.attr('data-confirm-msg')))
	        return false;

	    $('body').addClass('loading');
	    
	    var ajaxPromise = sendAjax(t.attr('href'),{'id': t.attr('data-id')},'POST');

	    ajaxPromise.then(function(data)
	    {
	        if(data.success) {
	            t.parents('.trash-parent').fadeOut(200, function() { 
	            	$(this).remove(); 
	            	calculateBasketPrice();
	            	getCartCount();
	            });
	            showNotification(data.response, 'success')

	        } else {
	            showNotification(data.response, 'error')
	        }

	        $('body').removeClass('loading');
	            
	    })

	    return false;
	});

	// Calculate basket price when input changes
	$(document).on('change','.basket-item', function() {
		calculateBasketPrice()
	})

	// Make links payment when clicking confirm-order
	$(document).on('click','.confirm-order', function()
	{
		var basket_items = [];

		$('.basket-item:checked').each(function(){
			basket_items.push( $(this).val() )
		})

		console.log(basket_items)

		$.ajax({
	        url: '/payment/make-links-payment',
	        type: 'POST',
	        data: {'links_id': basket_items},
	        dataType: 'json',
	        success: function(data) {

	        	if(!data.success && data.payment_form  != undefined) {
            		var modal = $('#order-payment');
					modal.find('.modal-body').html(data.payment_form)
					modal.modal('show')
					return false;
            	}

	        	if(data.success) {
	        		window.top.location = data.redirect;
	        	} else {
	        		showNotification(data.response,'error')
	        	}
	        }
	    });
	})	

	$(document).on('click','.ajax-link', function() 
	{
	    var t = $(this);

	    $('body').addClass('loading');
	    
	    var ajaxPromise = sendAjax(t.attr('href'),{},'GET');

	    ajaxPromise.then(function(data)
	    {
	        if(data.success) {
	            if(data.replace !== undefined) {
	                t.parent().html(data.replace)
	            }
	            showNotification(data.response, 'success')
	        } else {
	            showNotification(data.response, 'error')
	        }

	        $('body').removeClass('loading');
	            
	    })

	    return false;
	});

	// Set multi select default selected
	if($('.mulpitply_checkbox_style').length) 
	{
		var preSelect = $('.multi-select').val();
		$('.mulpitply_checkbox_style').each(function(){
			  if($.inArray($(this).val(), preSelect ) != -1){
			    $(this).trigger('click');
			  }
		});
	}

	if($('.popup_msg').length) {   
		var title = null;

		if($('.popup_msg').attr('data-title') !==undefined) {
			title = $('.popup_msg').attr('data-title');
		}

        showNotification($('.popup_msg').html(), $('.popup_msg').attr('data-type'),title)
    }

    $(document).on('change','.city-select', function() {
    	if($(this).val() == 2) {
    		$('.target-parent').removeClass('d-none')
    	} else {
    		$('.target-parent').addClass('d-none')
    	}
    	return false;
    })


    $(document).on('change','.parcel-item,.city-select,.target-select', function() {
        var parcels 	= $(".parcel-item").val();
        var city_id 	= $('.city-select').val()
        var target_id 	= $('.target-select').val()
        var delivery_type = $('.delivery-type').length && $('.delivery-type').is(':checked') ? 1 : 0;

        if($(parcels).length && city_id !="" && ( (target_id !="" && city_id == 2) || city_id !=2 )) 
        {
            $.ajax({
                url: $(this).parents('form').attr('data-calc-url'),
                type: 'POST',
                data: {'parcels': parcels,'delivery_type': delivery_type,'city_id': city_id,'target_id': target_id},
                dataType: 'json',
                success: function(data) {
                    $('.total-payable-amount').html(data)
                }
            });
        }
    })

    // Submit custom form
	$(document).on('click','.btn-ajax-content', function(event, jqXHR, settings) 
	{
		event.preventDefault();
	    var target = $(this).attr('data-modal');

	    $.ajax({
	        url: $(this).attr('data-ajax-href'),
	        type: 'GET',
	        data: {},
	        dataType: 'json',
	        success: function(data) {
	            if(data.success) {
	            	var modal = $(target);
					modal.find('.modal-body').html(data.response)
					modal.modal('show');
					return false;
	            } 

	            showNotification(data.response, 'error');
	        }
	    });

	    return false;
	});

	$(document).on('change', '#profile-photo', function() 
	{
	    var progressBar = $('.f-progress'),
	        bar = $('.f-progress__bar'),
	        percent = $('.f-progress__percent');

	    $('#image_upload_form').ajaxForm({
	        beforeSend: function() {
	            progressBar.fadeIn();
	            var percentVal = '0%';
	            bar.width(percentVal)
	            percent.html(percentVal);
	        },
	        uploadProgress: function(event, position, total, percentComplete) {
	            var percentVal = percentComplete + '%';
	            bar.width(percentVal)
	            percent.html(percentVal);
	        },
	        success: function(html, statusText, xhr, $form) {
	            obj = $.parseJSON(html);
	            if (obj.status) {
	                var percentVal = '100%';
	                bar.width(percentVal)
	                percent.html(percentVal);
	                $(".dashboard-layout__sidebar__holder__account__user__img img").prop('src', obj.image_medium);
	            } else {
	                showNotification(obj.error, 'error');
	            }
	        },
	        complete: function(xhr) {
	            progressBar.fadeOut();
	        }
	    }).submit();

	});

	$(document).on('click','.btn-conditional-modal', function() {
		var t = $(this);
		$('.redirect-url').val(  t.attr('href') )
	})

	$(document).on('keydown','.verification-code--control-group input', function() {
        var code = [];
        
        $('.verification-code--control-group input').each(function() {
         	$(this).val() ? code.push($(this).val()) : '';
        })

        if($(code).length == 4) {
        	var code = code.join('');
        	$.ajax({
	            url: '/confirm-process.html',
	            type: 'POST',
	            data: {'code': code,'action': 'signup'},
	            dataType: 'json',
	            success: function(data) {
	             	if(!data.success) {
	             		$('.verification-code--control-group').addClass('has-error')
	             		return false;
	             	}
	            }
	        });
        }

        $('.verification-code--control-group').removeClass('has-error')
    })

    $(document).on('click','.check-all',function() {

    	$(this).toggleClass('checked')

    	$(this).parents('.dashboard-layout__content__body').find('.check-item').prop('checked' , $(this).hasClass('checked') ).trigger('change')

    	if($(this).hasClass('basket-check')) 
    	{
    		calculateBasketPrice();
    	}
    })

    $(document).on('keyup','.searchInputeasySelect',function() {
    	$(this).val( $(this).val().toLowerCase() )
    })

    $(document).on('change','#parcel-invoice_file',function() {
    	$('.fileupload-placeholder').html( $(this).val() )
    })

    $(document).on('change','.invoice-file input',function(e){
    	setTimeout(function(){
    		if(!e.target.files.length || !$('.invoice-file-main').hasClass('has-success'))
	    		return false;

	    	$('.invoice-file-name').html( e.target.files[0].name )
	    	$('.no-invoice-file').removeClass('d-none')
    	},300)
    }) 

    $(document).on('click','.fileupload-file__remove', function() {

    	if($(this).parents('.no-invoice-file').length) {
    		$('.invoice-file input').val('')
    		$('.no-invoice-file').addClass('d-none')
    		return;
    	}

    	if(!confirm($(this).attr('data-confirm-msg')))
    		return false;

    	var ajaxPromise = sendAjax($(this).attr('data-href'),{},'POST');

	    ajaxPromise.then(function(data)
	    {	
	        if(data.success) {
	        	$('.file-list').addClass('d-none')
	        } else {
	            showNotification(data.response, 'error')
	        }	            
	    })

	    return false;
    })


    // Make links payment when clicking confirm-order
	$(document).on('click','.confirm-debt-payment', function()
	{
		if(!confirm( $(this).attr('data-msg') )) {
			return false;
		}	

		var items = [];

		$('.debt-item:checked').each(function(){
			items.push( $(this).val() )
		})

		$.ajax({
	        url: '/payment/pay-order-debts',
	        type: 'POST',
	        data: {'debt_id': items},
	        dataType: 'json',
	        success: function(data) {
	        	if(data.success) {
	        		window.top.location = data.redirect;
	        	} else {
	        		showNotification(data.response,'error')
	        	}
	        }
	    });
	})


	const calculateDebtAmount = function() {

		if(!$('.debt-item').length) {
			return false;
		}

		var total_price = 0;

		$('.debt-item:checked').each(function() {
			total_price += parseFloat( $(this).attr('data-amount') );
		})

		$('.total-payable-amount').html( total_price.toFixed(2))
	}

    $(document).on('change','.debt-item',function() {
    	calculateDebtAmount();
    })	

    $(document).on('change','.citizenship-select',function() {
		var options = $.parseJSON($(this).find('option:selected').attr('data-options'));

		$('.document-series option').remove()

		$.each(options, function(key, value) {   
		     $('.document-series')
		         .append($("<option></option>")
		                    .attr("value", key)
		                    .text(value)); 
		});

		$('.document-series').niceSelect('update');
	})

	$(document).on('change','.converter-holder-block--input,.currency-select', function() {
		var t = $(this);
		calculateCurrency(t)
	})

	const calculateCurrency = function(t) {
		var st_input = Number($('.converter-holder-block--input:eq(0)').val().replace(',','.'));
		var sn_input = Number($('.converter-holder-block--input:eq(1)').val().replace(',','.'));
		var st_currency = $('.currency-select:eq(0)').val();
		var sn_currency = $('.currency-select:eq(1)').val();
		var currency = $.parseJSON($('.currency-select').attr('data-currency'))

		if(isNaN(st_input) || isNaN(sn_input)) {
			return false;
		}

		console.log(t.parents('.converter-holder-block').index())
		if($(t).is('input') && t.parents('.converter-holder-block').index() == 1) {
			var amount = ((currency[st_currency] / currency[sn_currency]) * st_input).toFixed(2)
			$('.converter-holder-block:eq(1) input').val(amount)
		} else {
			var amount = ((currency[sn_currency] / currency[st_currency]) * sn_input).toFixed(2)
			$('.converter-holder-block:eq(0) input').val(amount)
		}

		return false;
	}

	$(document).on('click','.btn-cashback-url', function(e){
	    e.preventDefault();
	    e.stopPropagation();

	    var url = $(this).attr('href')

	    console.log(url)

	    $.ajax({
	        type: 'post',
	        url: "https://api.iadeal.com/v1.0/deeplink/generate",
	        data:
	        {
	            merchantKey: "nUfErTlTV3mXsWHlIA4LUeAThqhrZWXsSg8PLSO1g/QyQhrdTLB5fIwKhnmNkVGQMB2beyuQH5NoHkyDWgtu0A==",
	            url: url
	        },
	        async: true,
	        beforeSend: function (request) {
	            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	            request.setRequestHeader("token", "K1XC6naLp0GS9r949YiQH0HMXJitYuKLJo2JKUCD+DIsNszEDyGoU5Rcq9Av7+X2");
	        },
	        success: function (data) {
	            var url = data.HasError ? data.Link : data.ConvertedLink;

	            window.open(url, '_blank');

	        },
	        error: function (xhr) {
	           
	        }
	    });

	    e.stopImmediatePropagation();
	})
})

$(document).on('click','.increase-balance-btn', function() {

	var amount = parseFloat($('.amount-input').val());

	if(isNaN(amount) || !amount) {
		$('.amount-input').addClass('has-error')
		return false;
	} else {
		$('.amount-input').removeClass('has-error')
	}

	$('.payment-amount').val( parseFloat($('.amount-input').val()) )
	var modal = $('#increase-balance');
		modal.modal('show')

	return false;
})

$(document).on('click','.trigger-file-input',function() {
	$('.file-input').click()
	return false;
})

