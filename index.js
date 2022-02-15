#!/usr/bin/env node

// imports from files
import inquirer from 'inquirer';
import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';
import fetch from 'node-fetch';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import gradient from 'gradient-string';

// Global variables
let questionsForUser = [];
let answersFromUser = [];
let questionOptions = [];
let score = 0;

const quesAmount = '10';
const quesCategories = [
  { id: 9, name: 'General Knowledge' },
  { id: 17, name: 'Science & Nature' },
  { id: 18, name: 'Computers' },
  { id: 30, name: 'Gadgets' },
  { id: 19, name: 'Mathematics' },
  { id: 15, name: 'Video Games' },
  { id: 21, name: 'Sports' },
  { id: 23, name: 'History' },
  { id: 22, name: 'Geography' },
  { id: 24, name: 'Politics' },
  { id: 27, name: 'Animals' },
  { id: 28, name: 'Vehicles' },
];
const quesDifficulties = ['easy', 'medium', 'hard'];
const quesTypes = ['Multiple Choice', 'True/False'];
const log = console.log;

figlet('Node Quiz', function (err, data) {
  if (err) {
    console.log('Something went wrong...');
    console.dir(err);
    return;
  }
  console.log(gradient.pastel.multiline(data) + '\n');
});

await sleep(2000);

const welcomeText = chalkAnimation
  .rainbow('Welcome to the Node Quiz!!!')
  .start();

await sleep(3000);

log(chalk.bgBlue('\nHOW TO PLAY'));
log(
  chalk.greenBright(
    'Select the Category, amount, difficulty and type of question below'
  )
);

getQuestionOptions();

function getQuestionOptions() {
  log(
    chalk.blue('\nPlease answer the following questions to Start the quiz\n')
  );
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'quesCategory',
        message: 'Select the category of questions',
        choices: quesCategories.map((category) => category.name),
      },
      {
        type: 'number',
        name: 'quesAmount',
        message: 'How many questions do you want to answer?(5-20)',
        default: 5,
        validate: (value) => {
          if (value < 5 || value > 20) return 'Enter a number between 5 to 20';
          return true;
        },
      },
      {
        type: 'list',
        name: 'quesDifficulty',
        message: 'Select the difficulty of questions',
        choices: quesDifficulties.map((difficulty) =>
          difficulty.toLocaleUpperCase()
        ),
        validate: (value) => value.toLowercase(),
      },
      {
        type: 'list',
        name: 'quesType',
        message: 'Select the type of questions',
        choices: quesTypes,
      },
    ])
    .then((answers) => {
      const { id } = quesCategories.find(
        (category) => category.name === answers.quesCategory
      );
      const type =
        answers.quesType === 'Multiple Choice' ? 'multiple' : 'boolean';

      questionOptions = {
        amount: answers.quesAmount,
        category: id,
        difficulty: answers.quesDifficulty.toLowerCase(),
        type,
      };
      return fetchQuestions();
    });
}

// function to fetch questions from API
async function fetchQuestions() {
  const spinner = createSpinner().start({
    text: 'Loading questions for you...!',
    color: 'green',
  });
  const { amount, category, difficulty, type } = questionOptions;

  const API_URL = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=${type}`;
  const { results } = await (await fetch(API_URL)).json();

  questionsForUser = results;

  spinner.success({ text: 'Here you go...', mark: ':)', color: 'green' });
  spinner.reset();

  startQuiz();
}

function startQuiz() {
  let questionList = [];

  questionsForUser.forEach((question, idx) => {
    const name = `question${idx + 1}`;
    const message = decodeHTMLEntities(question.question);
    const choices = shuffle(
      [...question.incorrect_answers, question.correct_answer].map((choice) =>
        decodeHTMLEntities(choice)
      )
    );

    const correctAns = question.correct_answer;

    questionList.push({
      type: 'list',
      name,
      message,
      choices,
    });
  });
  askQuestions(questionList);
}

const askQuestions = (questionArr) => {
  inquirer.prompt(questionArr).then((answers) => {
    answersFromUser = answers;
    const spinner = createSpinner().start({
      text: 'Calculating your score...',
      color: 'blue',
    });

    sleep(3000).then(() => {
      spinner.reset();
      calculateScore();
    });
  });
};

function calculateScore() {
  questionsForUser.forEach((question, idx) => {
    const name = `question${idx + 1}`;
    const correctAns = question.correct_answer;
    const userAns = answersFromUser[name];

    if (correctAns === userAns) score++;
  });
  log(score);
  endgame();
}

function endgame() {
  console.clear();

  figlet(`Congrats\n `, (err) => {
    log(
      gradient.pastel.multiline(
        `Your answered ${score} question(s) Correctly and your score is ${score}/${questionsForUser.length}`
      ) + '\n'
    );
    log(chalk.greenBright(`Thanks for playing :)`));
    process.exit(0);
  });
}

function decodeHTMLEntities(text) {
  const entities = [
    ['amp', '&'],
    ['apos', "'"],
    ['#x27', "'"],
    ['#x2F', '/'],
    ['#039', "'"],
    ['#047', '/'],
    ['lt', '<'],
    ['gt', '>'],
    ['nbsp', ' '],
    ['quot', '"'],
  ];

  for (let i = 0, max = entities.length; i < max; ++i)
    text = text.replace(
      new RegExp('&' + entities[i][0] + ';', 'g'),
      entities[i][1]
    );

  return text;
}

function shuffle(array) {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
