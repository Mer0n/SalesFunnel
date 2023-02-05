$(document).ready(function() {
    // initialize questions array with values
    var questions = [
        {
            question: 'What platform?',
            options: [
                {
                    id: 4,
                    name: 'PC'
                },
                {
                    id: 16,
                    name: 'Playstation 3'
                },
                {
                    id: 18,
                    name: 'Playstation 4'
                },
                {
                    id: 187,
                    name: 'Playstation 5'
                },
                {
                    id: 14,
                    name: 'Xbox 360'
                },
                {
                    id: 186,
                    name: 'Xbox Series S/X'
                },
                {
                    id: 1,
                    name: 'Xbox One'
                }

            ]
        },
        {
            question: 'What Genre?',
            options: [
                {id: 4, name: 'Action'},
                {id: 3, name: 'Adventure'},
                {id: 2, name: 'Shooter'},
                {id: 5, name: 'RPG'},
                {id: 51, name: 'Indie'},
                {id: 10, name: 'Strategy'},
                {id: 15, name: 'Sports'},
                {id: 1, name: 'Racing'},
                {id: 6, name: 'Fighting'}
            ]
        },
        {
            question: 'What year was it released?',
            options: [
                '2021',
                '2020',
                '2019',
                '2018',
                '2017',
                '2016',
                '2015',
                '2014',
                '2013',
                '2012',
                '2011'
            ]
        },
        {
            question: 'Lowest acceptable rating?',
            options: [
                '0',
                '1',
                '2',
                '3',
                '4',
                '5'
            ]
        }
    ];
    //initialize answer to null for each question
    var selectedAnswer = [null, null, null, null];

    // loads the question based on the question number passed
    var loadQuestion = function(qNumber) {
        // show the question container
        $('.question-container').show();
        // clear the current displayed question
        $('.questions').html("");
        var question = questions[qNumber]; // get the question from questions array based on the qNumber
        var qEl = $("<div class='question'></div>").text(question.question); // create question div
        // append the question div to questions div
        $('.questions').append(qEl);
        var optionsEl = $("<div class='answer'></div>"); // creates answer div
        // creates inputs for each option and appends to the answer div
        question.options.forEach(opt => {

            if (opt.id === undefined) {
                const checked = opt === selectedAnswer[qNumber] ? 'checked': '';
                optionsEl.append($(`<label><input type='radio' ${checked} name='answer'  value="${opt}" />${opt}</label>`));
            } else {
                const checked = opt.id === parseInt(selectedAnswer[qNumber], 10) ? 'checked': '';
                optionsEl.append($(`<label><input type='radio' name='answer' ${checked} value="${opt.id}" />${opt.name}</label>`));
            }

        });
        // append options to the questions div
        $('.questions').append(optionsEl);
        // add change event to handle the selected answer
        $("input[type=radio]").change(function(e) {
            console.log(e.target.value);
            selectedAnswer[qNumber] = (e.target.value); // update the answer to specific question with the selected option
            $("#btn-next").prop('disabled', false); // enable the next button
        })
        if (selectedAnswer[qNumber]) {
            $("#btn-next").prop('disabled', false) // enable next button
        } else {
            $("#btn-next").prop('disabled', true); // disable next button
        }


    }

    var questionCtr = 0;
    loadQuestion(questionCtr); // load the first question
    var timeLeft = 20; // initialize time left to 20 sec
    var timePicked = 0; // initialize time picked

    // displays the timer on the screen
    var startTimer = function() {
        $('.promo-text').show();
        $('.time-left').show();
        $('.retail-price').css('text-decoration', 'line-through');
        const timer = setInterval(() => {
            // if time left is zero, hide the timer, the text and  the sale price in the table
            if (timeLeft === 0) {
                $('.retail-price').css('text-decoration', '');
                $('.sale-price').hide();
                clearInterval(timer);
                $('.promo-text').hide();
                $('.time-left').hide();
            }
            // show the time remaining time every 1sec
            $('.timer').html(`${timeLeft}s`);
            timeLeft--;
        }, 1000);
    }
    var selectedGame;
    var ctr = 1; // set ctr to 1
    //initialize the apiURL globally
    var apiUrl = "https://api.rawg.io/api/games?key=cb190c935ce245f19bb4a9d405894390&page_size=40&";
    // loads the results from the api request based on the specified answers from the customer
    var loadResult = async function(url) {
        //hide the question container
        $('.question-container').hide();
        // show the result div
        $('.result').show();
        $('.products').hide(); // hide products div

        console.log(selectedAnswer);
        // deconstruct the selectedAnswer array and assign to respective variables
        const [platform, genre, year, rating] = selectedAnswer;
        // construct the request params based on the selected answers
        const params = `dates=${year}-01-01,${year}-12-31&genres=${genre}&platforms=${platform}`;
        // send the get request to the specified api url
        // use async await since fetch will return a promise
        const req = await fetch(url + params);
        const response = await req.json(); // get the json response
        console.log(response);
        const nextUrl = response.next; // get the next page URL and assign to nextUrl variable
        // filter the results based on the rating
        const results = response.results.filter(res => Math.floor(res.rating) === parseInt(rating, 10))
        console.log(results);
        const hideTable = !results.length;
        // hide the table if there's no result
        if (hideTable) {

            if (ctr === 4 || !nextUrl) {
                $('.noresult').show(); // show no result message
                $('.table').hide(); // hide the table
                // allow the customer to back
                $('#btn-back2').click(function(e){
                    prevQuestion(); // load previous question
                    $('.result').hide(); // hide result diiv
                })
            } else {
                // continue to send request if nextUrl is not null and the ctr is less than 4
                if (nextUrl) {
                    await loadResult(nextUrl); // call loadResult with the nextUrl
                    ctr++;
                }

            }

        } else {

            $('.table').show(); // show the table
            $('.noresult').hide(); // hide noresult div
            $('.table-rows').html(""); // empty the table rows div
            // update the results and apply random price for each game
            results.map(game => {
                game.price = Math.floor(10 + (Math.random() * 100)); // generate random price
                game.sale_price = game.price * .50; // assign 50% off of the price
                return game;
            }).forEach((game, index) => {
                // create rows with data from each game and append to the table-rows
                const row = $(`<tr id="game_${index}"></tr>`);
                row.append(`<td>${game.name}</td><td><img src="${game.background_image}" width="200"/></td><td><span class="retail-price">$${game.price}</span> <span class="sale-price">$${game.sale_price}</span></td>`);
                $('.table-rows').append(row);
            });
            // add click event to tr to handle the selected game from the table
            $(`tr[id^='game_']`).click(function(e) {
                timePicked = timeLeft; // set timePicked with the current timeLeft
                // get the row index from the id by splitting it with underscore
                const index = parseInt($(this).attr('id').split('_')[1], 10);
                selectedGame = results[index]; // get the selected game from results using the index
                $('.result').hide(); // hide result div
                // show the game info with the price to the screen
                const gameName = $(`<h1 class="game-name">${selectedGame.name}</h1>`);
                const price = $(`<h1 class="game-price">$${timePicked > 0 ? selectedGame.sale_price : selectedGame.price}</h1>`)
                $('.subscription').show();
                $('.game-info').append(gameName, price);
                $('.subscription').css("background-image", `url("${selectedGame.background_image}")`);
                console.log(selectedGame);
            });
            startTimer(); // call the startTimer
        }

    }
    // add click event to the next button
    $("#btn-next").click(function(e) {

        questionCtr++; // increment the questionCtr
        // call loadResult if question is greater than 3
        if (questionCtr > 3) {
            loadResult(apiUrl);
        } else {
            // load the next question
            loadQuestion((questionCtr))
        }
        $('#btn-back').show(); // show the back button


    });
    // add click event to the back button
    $('#btn-back').click(function(e) {
        prevQuestion(); // load previous question
    });

    // loads the previous question
    var prevQuestion = function() {
        questionCtr--;
        console.log(selectedAnswer);
        // if it's in the first question, hide the back button
        if (questionCtr <= 0) {
            $("#btn-back").hide();
        }
        // if questionCtr greater or equal to 0, then load the Question and enable the next button
        if (questionCtr >= 0){
            loadQuestion((questionCtr));
            $("#btn-next").prop('disabled', false);
        }

    }
    // add submit event to display the thank you message
    $("#game-form").submit(function(e) {
        e.preventDefault();
        $('.cust-form').hide(); // hide the form
        $('.thank-you').fadeIn(100); // show thank you div
        const email = $('#email-address').val(); // get the customer's email address
        // set the sale price if timePicked is greater than 0, otherwise set the original price
        const price = timePicked > 0 ? selectedGame.sale_price : selectedGame.price;
        const message = `<h3 style="color: white">Thank you ${email}, for purchasing ${selectedGame.name} for $${price}!`;
        $('.thank-you').append(message); // append the message to the thank you div

    });
    // shows the product page
    $("#products").click(function(e){
        e.preventDefault();
        $('.question-container').hide();
        $('.result').hide();
        $('.subscription').hide();
        $('.products').show();
        $('.table').show();
        $('.contact').hide();
        showAllProducts(); // load all products
    });

    // get all products from the api and display to the product page
    var showAllProducts = async function () {
        const req = await fetch("https://api.rawg.io/api/games?key=cb190c935ce245f19bb4a9d405894390&page_size=40&");
        const response = await req.json();
        response.results.map(game => {
            game.price = Math.floor(10 + (Math.random() * 100));
            return game;
        }).forEach((game, index) => {
            const row = $(`<tr id="prodcuts-game_${index}"></tr>`);
            row.append(`<td>${game.name}</td><td><img src="${game.background_image}" width="200"/></td><td><span class="retail-price">$${game.price}</span></td>`);
            $('.products-table-rows').append(row);
        });
    }
    // displays contact page
    $('#contact').click(function(e) {
        e.preventDefault();
        $('.question-container').hide();
        $('.result').hide();
        $('.subscription').hide();
        $('.products').hide();
        $('.table').hide();
        $('.contact').show();
    });
});