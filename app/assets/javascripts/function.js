var app = angular.module('schoolloan',['angular-click-outside']);

/* ------------ filters start ---------------- */
app.filter('myCurrency', ['$filter', function ($filter) {
  return function(input) {
    input = parseFloat(input);

    if(input % 1 === 0) {
      input = input.toFixed(0);
    }
    else {
      input = input.toFixed(2);
    }

    return '$' + input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
}]);
app.factory('focus', function($timeout, $window) {
    return function(id) {
      // timeout makes sure that it is invoked after any other event has been triggered.
      // e.g. click events that need to run before the focus or
      // inputs elements that are in a disabled state but are enabled when those events
      // are triggered.
      $timeout(function() {
        var element = $window.document.getElementById(id);
        if(element)
          element.focus();
      });
    };
  });
app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });
                event.preventDefault();
            }
        });
    };
}).directive('eventFocus', function(focus) {
    return function(scope, elem, attr) {
      elem.on(attr.eventFocus, function() {
        focus(attr.eventFocusId);
      });

      // Removes bound events in the element itself
      // when the scope is destroyed
      scope.$on('$destroy', function() {
        elem.off(attr.eventFocus);
      });
    };
  });;
/* ------------ filters end ---------------- */

app.controller('loan-calc', function($scope) {
/* ------------ constraints start ---------------- */
  	$scope.years = [
  		"0.5",
  		"1",
  		"1.5",
  		"2",
  		"2.5",
  		"3",
  		"3.5",
  		"4",
  		"4.5",
  		"5",
  		"5.5",
  		"6",
  		"6.5",
  		"7"
  	];
  	$scope.gpas = [
  		"> 4.0",
  		"3.6 - 4.0",
  		"3.1 - 3.5",
  		"2.6 - 3.0",
  		"2.0 - 2.5"
  	];
  	$scope.states = [
  		"Alabama",
			"Alaska",
			"Arizona",
			"Arkansas", 
			"California",
			"Colorado",
			"Connecticut",
			"Delaware",
			"Florida",
			"Georgia",
			"Hawaii",
			"Idaho",
			"Illinois Indiana",
			"Iowa",
			"Kansas",
			"Kentucky",
			"Louisiana",
			"Maine",
			"Maryland",
			"Massachusetts",
			"Michigan",
			"Minnesota",
			"Mississippi",
			"Missouri",
			"Montana Nebraska",
			"Nevada",
			"New Hampshire",
			"New Jersey",
			"New Mexico",
			"New York",
			"North Carolina",
			"North Dakota",
			"Ohio",
			"Oklahoma",
			"Oregon",
			"Pennsylvania Rhode Island",
			"Puerto Rico",
			"South Carolina",
			"South Dakota",
			"Tennessee",
			"Texas",
			"Utah",
			"Vermont",
			"Virginia",
			"Washington",
			"West Virginia",
			"Wisconsin",
			"Wyoming"
  	];
  	$scope.interrate = 5.9;
  	$scope.period = 10;
  	$scope.errordetail1 = "";
  	$scope.errordetail2 = "";
  	$scope.errordetail3 = "";
    $scope.errordetail4 = ""; 
    $scope.errordetail5 = ""; 
  	$scope.schoolnames = "";
  	$scope.major = "";
    $scope.loantermyears = "";
    $scope.stateofresidence = "";
  	$scope.familycontribution = "";
  	$scope.annualsalary = 0;
  	$scope.annualtuition = 0;
  	$scope.loanamount = 0;
  	$scope.monthpayment = 0;
  	$scope.editmode = false;
  	$scope.editmode1 = false;
  	$scope.editmode2 = false;	
  	$scope.errorcolor = "#abacae";
    $scope.loan_star = "";
    $scope.comp_school1_star = "";
    $scope.comp_school2_star = "";
    $scope.database_no_string = "";    
    $scope.comp_database_no_string1 = "";
    $scope.comp_database_no_string2= "";
    var dbnostr_pattern = "* National average salary for the input major. Our database did not contain the salary data for the input school and major."; 
    var currentstate = "";
/* ------------ constraints end ---------------- */

/* ------------ functions start ---------------- */	
    // var loan_autocomplete = $('#loan_term_years').typeahead();
    //       loan_autocomplete.data('typeahead').source = $scope.years;
    $scope.refreshmajors = function(){
    	$.ajax({
	      type: "POST",
	      url: "/get_majors",
	      async: false,
	      data: { currentschool: $scope.schoolnames },	
	      success: function(data) {
	      	var autocomplete = $('#major').typeahead();
					autocomplete.data('typeahead').source = data;

	      	return false;
	      },
	      error: function(data) {
	      	alert(data);
	      	return false;
	      } 
	    });
    };

    $scope.salary_focus = function($timeout){
      focus('annaul_salary');
    }

    $scope.remove_school_validation = function(){
    	$scope.errordetail1 = "";
    }
    $scope.remove_major_validation = function(){
    	$scope.errordetail2 = "";
    }
    $scope.remove_family_validation = function(){
    	$scope.errordetail3 = "";
    }
    $scope.remove_loantermyears_validation = function(){
      $scope.errordetail4 = "";
      $("#s2id_loan_term_years a").css('border-color','#abacae');
      $('#loan_term_arrow').css('color','#abacae');
      $('#loan_term_arrow').css('border-color','#abacae');
    }
    $scope.remove_stateofresidence_validation = function(){
      $scope.errordetail5 = "";
      $("#s2id_state_of_residence a").css('border-color','#abacae');
      $('#state_arrow').css('color','#abacae');
      $('#state_arrow').css('border-color','#abacae');
    }
    $scope.putNA = function(){
      if($scope.schoolnames!='' && $scope.major!=''){
        $.ajax({
          type: "POST",
          url: "/get_universitystate",
          async: false,
          data: { currentschool: $scope.schoolnames}, 
          success: function(data) {
            var response = data;
            if(response.length == 1){
              currentstate = response[0].states;
            }else{
            }
          },
          error: function(data) {
            alert(data);
            return false;
          } 
        });
        $.ajax({
          type: "POST",
          url: "/get_result",
          async: false,
          data: { currentschool: $scope.schoolnames,currentmajor: $scope.major }, 
          success: function(data) {
            var response = data;
            var loantermyears = parseFloat($("#loan_term_years").val());
            if(response['currentmajor'].length == 0 && response['currentschool'].length ==0){
              $scope.annualsalary = "N/A";
              $scope.annualtuition = "N/A";
              $scope.loanamount = "N/A";
              $scope.monthpayment = "N/A";
            }   
            else{
              $scope.annualsalary = 0;
              $scope.annualtuition = 0;
              $scope.loanamount = 0;
              $scope.monthpayment = 0;
            }    
            return false;
          },
          error: function(data) {
            alert(data);
            return false;
          } 
        });

      }
    }
    $scope.calc = function(param){
      $scope.loan_star = "";
      $scope.comp_school2_star = "";
      $scope.comp_school1_star = "";
      $scope.loan_database_no_string = "";
      if($scope.loantermyears.length ==0){
         $("#s2id_loan_term_years a").css('border-color','#a94442');
         $('#loan_term_arrow').css('color','#a94442');
         $('#loan_term_arrow').css('border-color','#a94442');

      }
      if($scope.stateofresidence.length ==0){
         $("#s2id_state_of_residence a").css('border-color','#a94442');
         $('#state_arrow').css('color','#a94442');
         $('#state_arrow').css('border-color','#a94442');
      }

    	if ($scope.schoolnames.length == 0) {
    		$scope.errordetail1 = "The schoolname is required!";
    		if ($scope.major.length == 0) {
    			$scope.errordetail2 = "The major is required!";
    		}
    		else{
    			$scope.errordetail2 = "";
    		}
        if ($scope.loantermyears.length == 0){
          $scope.errordetail4 = "The loan term years is required!";
        }
        if ($scope.stateofresidence.length == 0){
          $scope.errordetail5 = "The state of residence is required!";
        }
        else if (isNaN($scope.loantermyears)) {         
          $scope.errordetail4 = "The loan term years must be numeric value!";
        }
    		if (isNaN($scope.familycontribution)) {
  				$scope.errordetail3 = "The family contribution must be numeric value!";
  			}
  			else{
  				$scope.errordetail3 = "";
  			}
    	}
    	else if ($scope.major.length == 0){
    		$scope.errordetail1 = "";
    		$scope.errordetail2 = "The major is required!";
    		if (isNaN($scope.familycontribution)) {
  				$scope.errordetail3 = "The family contribution must be numeric value!";
  			}
  			else{
  				$scope.errordetail3 = "";
  			}
        if ($scope.loantermyears.length == 0){
          $scope.errordetail4 = "The loan term years is required!";
        }
        if ($scope.stateofresidence.length == 0){
          $scope.errordetail5 = "The state of residence is required!";
        }
        if (isNaN($scope.loantermyears)) {
          $scope.errordetail4 = "The loan term years must be numeric value!";
        }
    	}
    	else if(isNaN($scope.familycontribution)){
    		$scope.errordetail1 = "";
    		$scope.errordetail2 = "";
    		$scope.errordetail3 = "The family contribution must be numeric value!";
        if ($scope.loantermyears.length == 0){
          $scope.errordetail4 = "The loan term years is required!";
        }
        if ($scope.stateofresidence.length == 0){
          $scope.errordetail5 = "The state of residence is required!";
        }
        else if (isNaN($scope.loantermyears)) {
          $scope.errordetail4 = "The loan term years must be numeric value!";
        }
    	}
      else if ($scope.loantermyears.length == 0){
        $scope.errordetail1 = "";
        $scope.errordetail2 = "";
        $scope.errordetail4 = "The loan term years is required!";
        if ($scope.stateofresidence.length == 0){
          $scope.errordetail5 = "The state of residence is required!";
        }
        if (isNaN($scope.familycontribution)) {
          $scope.errordetail3 = "The family contribution must be numeric value!";
        }
        else{
          $scope.errordetail3 = "";
        }
        if (isNaN($scope.loantermyears)) {
          $scope.errordetail4 = "The loan term years must be numeric value!";
        }
      }

      else if ($scope.stateofresidence.length == 0){
        $scope.errordetail1 = "";
        $scope.errordetail2 = "";
        $scope.errordetail4 = "";
        $scope.errordetail5 = "The state of residence is required!"
        if (isNaN($scope.familycontribution)) {
          $scope.errordetail3 = "The family contribution must be numeric value!";
        }
        else{
          $scope.errordetail3 = "";
        }
        if (isNaN($scope.loantermyears)) {
          $scope.errordetail4 = "The loan term years must be numeric value!";
        }
      }
      else if(isNaN($scope.loantermyears)){
        $scope.errordetail1 = "";
        $scope.errordetail2 = "";
        $scope.errordetail3 = "";
        $scope.errordetail4 = "The family contribution must be numeric value!";
      }

    	else{
    		$scope.errordetail1 = "";
    		$scope.errordetail2 = "";
    		$scope.errordetail3 = "";
        $scope.errordetail4 = "";
        $.ajax({
          type: "POST",
          url: "/get_universitystate",
          async: false,
          data: { currentschool: $scope.schoolnames}, 
          success: function(data) {
            var response = data;
            if(response.length == 1){
              currentstate = response[0].states;
            }else{
            }
          },
          error: function(data) {
            alert(data);
            return false;
          } 
        });


    		$.ajax({
		      type: "POST",
		      url: "/get_result",
		      async: false,
		      data: { currentschool: $scope.schoolnames,currentmajor: $scope.major },	
		      success: function(data) {
		      	var response = data;
		      	var loantermyears = parseFloat($("#loan_term_years").val());
            
            if(param == 1){
  		      	if(response.length == 1){
  		    		  $scope.annualsalary = response[0].median_earning;
  		      		$scope.annualtuition = ($('#select2-chosen-2').text()==currentstate)? response[0].In_State_tuition : response[0].Out_State_tuition;	
              }
              else{
                if(response['currentmajor'].length == 0 && response['currentschool'].length ==0){
                  $scope.annualsalary = "N/A";
                  $scope.annualtuition = "N/A";
                  $scope.loanamount = "N/A";
                  $scope.monthpayment = "N/A";
                  return;
                }
  		      		else if(response['currentmajor'].length == 0){
  		      			$scope.annualsalary = "N/A";
                  $scope.annualtuition = ($('#select2-chosen-2').text()==currentstate)? response['currentschool'][0].In_State_tuition : response['currentschool'][0].Out_State_tuition; 
  		      		}
                else{
                  $scope.loan_star="*";
                  $scope.loan_database_no_string = dbnostr_pattern;
  		      			$scope.annualsalary = response['currentmajor'][0].median_earning;
                  $scope.annualtuition = 0;
  		      		}
                
  		      	}
  		      	familycontribut = (isNaN(parseInt($scope.familycontribution, 10)))? 0:parseInt($scope.familycontribution, 10);
  		      	$scope.loanamount = ($scope.annualtuition * loantermyears> familycontribut )? ($scope.annualtuition * loantermyears - familycontribut):0;
  		      	$scope.monthpayment = ($scope.loanamount * Math.pow((1 + ($scope.interrate/100)), $scope.period * 12)*($scope.interrate/100)) / ( Math.pow( 1 + ($scope.interrate/100) , $scope.period * 12) - 1 );
              if($scope.interrate == 0){
                $scope.monthpayment = $scope.loanamount / ($scope.period * 12);
              }
              if($scope.period == 0){
                $scope.monthpayment = 0;
              }
            }

            else if(param == 2){
              if(response.length == 1){
                annualsalary = response[0].median_earning;  
                annualtuition = ($('#select2-chosen-2').text()==currentstate)? response[0].In_State_tuition : response[0].Out_State_tuition;
              }
              else{
                if(response['currentmajor'].length == 0 && response['currentschool'].length ==0){
                  $scope.annualsalary = "N/A";
                  $scope.annualtuition = 0;
                }
                else if(response['currentmajor'].length == 0){
                  annualsalary = 0;
                  annualtuition = ($('#select2-chosen-2').text()==currentstate)? response[0].In_State_tuition : response[0].Out_State_tuition; 
                }else{
                  $scope.loan_star="*";
                  $scope.loan_database_no_string = dbnostr_pattern;
                  annualsalary = response['currentmajor'][0].median_earning;
                  annualtuition = 0; 
                }
                                 
              }
              familycontribut = (isNaN(parseInt($scope.familycontribution, 10)))? 0:parseInt($scope.familycontribution, 10);
              loanamount = (annualtuition * loantermyears > familycontribut )? (annualtuition * loantermyears - familycontribut):0;
              $scope.monthpayment = (loanamount * Math.pow((1 + ($scope.interrate/100)), $scope.period * 12)*($scope.interrate/100)) / ( Math.pow( 1 + ($scope.interrate/100) , $scope.period * 12) - 1 );              
              if($scope.interrate == 0){
                $scope.monthpayment = loanamount / ($scope.period * 12);
              }
              if($scope.period == 0){
                $scope.monthpayment = 0;
              }
            }
            return false;
		      },
		      error: function(data) {
		      	alert(data);
		      	return false;
		      } 
	    	});
    	}
    };
    $scope.calcchange1 = function(){
    	$scope.editmode1 = false;
    	var loantermyears = parseFloat($("#select2-chosen-1").text());
    	familycontribut = (isNaN(parseInt($scope.familycontribution, 10)))? 0:parseInt($scope.familycontribution, 10);
		  $scope.loanamount = ($scope.annualtuition * loantermyears > familycontribut )? ($scope.annualtuition * loantermyears - familycontribut):0;
		  $scope.monthpayment =  ($scope.loanamount * Math.pow((1 + ($scope.interrate/100)), $scope.period * 12)*($scope.interrate/100)) / ( Math.pow( 1 + ($scope.interrate/100) , $scope.period * 12) - 1 );
      if($scope.interrate == 0){
        $scope.monthpayment = $scope.loanamount / ($scope.period * 12);
      }
      if($scope.period == 0){
        $scope.monthpayment = 0;
      }
    }
    $scope.calcchange2 = function(){
    	$scope.editmode2 = false;
    	var loantermyears = parseFloat($("#select2-chosen-1").text());
    	familycontribut = (isNaN(parseInt($scope.familycontribution, 10)))? 0:parseInt($scope.familycontribution, 10);
    	$scope.annualtuition = (parseInt($scope.loanamount, 10) + familycontribut) / loantermyears;
      $scope.monthpayment =  ($scope.loanamount * Math.pow((1 + ($scope.interrate/100)), $scope.period * 12)*($scope.interrate/100)) / ( Math.pow( 1 + ($scope.interrate/100) , $scope.period * 12) - 1 );
      if($scope.interrate == 0){
        $scope.monthpayment = $scope.loanamount / ($scope.period * 12);
      }
      if($scope.period == 0){
        $scope.monthpayment = 0;
      }

    }

/* ------------ functions end ---------------- */
});
app.controller('school-compare', function($scope) {
/* ------------ constraints start ---------------- */
  	$scope.majors1 = [];
  	$scope.majors2 = [];
  	$scope.majorranking1 = "0";
  	$scope.majorranking2 = "0";
  	$scope.overallranking1 = "0";
  	$scope.overallranking2 = "0";
  	$scope.mediumsalary1 = "0";
  	$scope.mediumsalary2 = "0";
  	$scope.instatetuition1 = "0";
  	$scope.instatetuition2 = "0";
    $scope.outstatetuition1 = "0";
    $scope.outstatetuition2 = "0";
  	$scope.monthpayment1 = "0";
  	$scope.monthpayment2 = "0";
/* ------------ constraints end ---------------- */
/* ------------ functions start ---------------- */	

    $scope.refreshmajor1 = function(){
      $scope.majorranking1 = "0";
      $scope.majorranking2 = "0";
      $scope.overallranking1 = "0";
      $scope.overallranking2 = "0";
      $scope.mediumsalary1 = "0";
      $scope.mediumsalary2 = "0";
      $scope.instatetuition1 = "0";
      $scope.instatetuition2 = "0";
      $scope.outstatetuition1 = "0";
      $scope.outstatetuition2 = "0";
      $scope.monthpayment1 = "0";
      $scope.monthpayment2 = "0";
      $('#select2-chosen-10').text("SCHOOL 1 MAJOR");  
      $('.detail-comp-school #select2-chosen-10').css('color','rgb(150,150,150)');
    	$.ajax({
	      type: "POST",
	      url: "/get_majors",
	      async: false,
	      data: { currentschool: $scope.schoolname1 },	
	      success: function(data) {
	      	$scope.majors1 = data;
	      	return false;
	      },
	      error: function(data) {
	      	alert(data)
	      	return false;
	      } 
	    });
    };

    $scope.refreshmajor2 = function(){
      $('#select2-chosen-12').text("SCHOOL 2 MAJOR");  
      $('.detail-comp-school #select2-chosen-12').css('color','rgb(150,150,150)');
      $scope.majorranking1 = "0";
      $scope.majorranking2 = "0";
      $scope.overallranking1 = "0";
      $scope.overallranking2 = "0";
      $scope.mediumsalary1 = "0";
      $scope.mediumsalary2 = "0";
      $scope.instatetuition1 = "0";
      $scope.instatetuition2 = "0";
      $scope.outstatetuition1 = "0";
      $scope.outstatetuition2 = "0";
      $scope.monthpayment1 = "0";
      $scope.monthpayment2 = "0";
      $.ajax({
	      type: "POST",
	      url: "/get_majors",
	      async: false,
	      data: { currentschool: $scope.schoolname2 },	
	      success: function(data) {
	      	$scope.majors2 = data;
	      	return false;
	      },
	      error: function(data) {
	      	alert(data);
	      	return false;
	      } 
	    });
    };

    $scope.refreshcalc1 = function(){
      $('.detail-comp-school #select2-chosen-10').css('color','white');
      $scope.comp_school1_star = "";
      $scope.comp_database_no_string1= "";
      $.ajax({
        type: "POST",
        url: "/get_universitystate",
        async: false,
        data: { currentschool: $scope.schoolname1}, 
        success: function(data) {
          var response = data;
          if(response.length == 1){
            currentstate = response[0].states;
          }else{
          }
        },
        error: function(data) {
          alert(data);
          return false;
        } 
      });
    	$.ajax({ 
	      type: "POST",
	      url: "/get_details",
	      async: false,
	      data: { currentschool: $scope.schoolname1, currentmajor:$scope.major1 },	
	      success: function(data) {
	      	var response = data; 
          $scope.interrate1 = 5.9;
          $scope.period1 = 10; 
          if(response['currentschoolmajor'] != null){      
            $scope.majorranking1 = response['currentschoolmajor'][0].major_ranking;
            $scope.overallranking1 = response['ranking'][0].ranking;
            $scope.mediumsalary1 = response['currentschoolmajor'][0].median_earning;           
            $scope.tuition1 = ($('#select2-chosen-2').text() == currentstate)? response['currentschoolmajor'][0].In_State_tuition : response['currentschoolmajor'][0].Out_State_tuition;              
            $scope.instatetuition1 = response['currentschoolmajor'][0].In_State_tuition;
            $scope.outstatetuition1 = response['currentschoolmajor'][0].Out_State_tuition;
          }
          else{
            $scope.comp_school1_star = "*";
            $scope.comp_database_no_string1 = "* National average salary for the input major. Our database did not contain the salary data for the input school and major.";
            $scope.majorranking1 = response['currentmajor'][0].major_ranking
            if(response['currentschool'].length == 0 ){
              $scope.overallranking1 = 0; 
              $scope.tuition1 = 0;
              $scope.instatetuition1 = 0;
              $scope.outstatetuition1 = 0; 
            }
            else{
              $scope.tuition1 = ($('#select2-chosen-2').text() == currentstate)? response['currentschool'][0].In_State_tuition : response['currentschool'][0].Out_State_tuition;   
              $scope.instatetuition1 = response['currentschool'][0].In_State_tuition;
              $scope.outstatetuition1 = response['currentschool'][0].Out_State_tuition;
              $scope.overallranking1 = response['ranking'][0].ranking;
            } 
            $scope.mediumsalary1 = response['national_major'][0].median_earning;
            
          }

        $scope.monthpayment1 = ($scope.tuition1 * Math.pow((1 + ($scope.interrate1/100)), $scope.period1 * 12)*($scope.interrate1/100)) / ( Math.pow( 1 + ($scope.interrate1/100) , $scope.period1 * 12) - 1 )
	      return false; 
        },
	      error: function(data) {
	      	alert(data);
	      	return false;
	      } 
	    });
    }

    $scope.refreshcalc2 = function(){
      $('.detail-comp-school #select2-chosen-12').css('color','white');
      $scope.comp_school2_star = "";
      $scope.comp_database_no_string2 = "";

      $.ajax({
          type: "POST",
          url: "/get_universitystate",
          async: false,
          data: { currentschool: $scope.schoolname2}, 
          success: function(data) {
            var response = data;
            if(response.length == 1){
              currentstate = response[0].states;
            }else{
            }
          },
          error: function(data) {
            alert(data);
            return false;
          } 
      });
    	$.ajax({
	      type: "POST",
	      url: "/get_details",
	      async: false,
	      data: { currentschool: $scope.schoolname2, currentmajor:$scope.major2 },	
        success: function(data) {
          var response = data; 
          $scope.interrate2 = 5.9;
          $scope.period2 = 10; 
          if(response['currentschoolmajor'] != null){      
            $scope.majorranking2 = response['currentschoolmajor'][0].major_ranking;
            $scope.overallranking2 = response['ranking'][0].ranking;
            $scope.mediumsalary2 = response['currentschoolmajor'][0].median_earning;           
            $scope.tuition2 = ($('#select2-chosen-2').text() == currentstate)? response['currentschoolmajor'][0].In_State_tuition : response['currentschoolmajor'][0].Out_State_tuition;              
            $scope.instatetuition2 = response['currentschoolmajor'][0].In_State_tuition;
            $scope.outstatetuition2 = response['currentschoolmajor'][0].Out_State_tuition;
          }
          else{
            $scope.comp_school2_star = "*";
            $scope.comp_database_no_string2 = "* National average salary for the input major. Our database did not contain the salary data for the input school and major.";
            $scope.majorranking1 = response['currentmajor'][0].major_ranking;
            $scope.majorranking2 = response['currentmajor'][0].major_ranking;
            if(response['currentschool'].length == 0 ){
              $scope.overallranking2 = 0; 
              $scope.tuition2 = 0;
              $scope.instatetuition2 = 0;
              $scope.outstatetuition2 = 0;

            }
            else{
              $scope.overallranking2 = response['ranking'][0].ranking;
              $scope.tuition2 = ($('#select2-chosen-2').text() == currentstate)? response['currentschool'][0].In_State_tuition : response['currentschool'][0].Out_State_tuition;    
              $scope.instatetuition2 = response['currentschool'][0].In_State_tuition;
              $scope.outstatetuition2 = response['currentschool'][0].Out_State_tuition;
            } 
            $scope.mediumsalary2 = response['national_major'][0].median_earning;
            
          }

        $scope.monthpayment2 = ($scope.tuition2 * Math.pow((1 + ($scope.interrate2/100)), $scope.period2 * 12)*($scope.interrate2/100)) / ( Math.pow( 1 + ($scope.interrate2/100) , $scope.period2 * 12) - 1 )
        return false;
        },
	      error: function(data) {
	      	alert(data);
	      	return false;
	      } 
	    });
    }

/* ------------ functions end ---------------- */
});