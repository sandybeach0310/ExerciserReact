import React, {Component} from "react";
import {connect} from "react-redux";
import {incrementExerciseCounter} from "../../store/actions/increment_counter";
import {addNewExercise, editExercise} from "../../store/actions/exercises";
import {FormattedMessage} from 'react-intl';
import {QUESTION,FINISH_EXERCISE,TITLE_OF_EXERCISE,CORRECT_OPTION, WRONG_OPTION,PREVIOUS,NEXT} from "../translation";
import {withRouter} from "react-router-dom"
import "../../css/MCQForm.css"

class MCQForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            edit:false,
            id:-1,
            title: '',
            noOfQuestions: 0,
            currentQuestionNo: 1,
            questions: [],
            scores:[],
            times:[],
            isFormValid: false,
            errors: {
                question: false,
                answers: false,
                title: false
            },
            currentQuestion: {
                id: 1,
                question: "",
                answers: ['', ''],
            }
        };

        console.log(this.props);
    }

    componentDidMount(){
        if(this.props.location.state){
            const {id, title, questions, scores, times}= this.props.location.state.exercise;
            const currentQuestion= questions[0];
            this.setState({
                ...this.state,
                id:id,
                title:title,
                edit:true,
                isFormValid:true,
                questions:questions,
                scores:scores,
                times: times,
                noOfQuestions:questions.length,
                currentQuestion:{
                    id:currentQuestion.id,
                    question: currentQuestion.question,
                    answers: currentQuestion.answers,
                    correctAns: currentQuestion.correctAns
                }
            });
        }
    }

    handleChangeAns = e => {
        const index = Number(e.target.name.split('-')[1]);
        const ans = this.state.currentQuestion.answers.map((ans, i) => (
            i === index ? e.target.value : ans
        ));
        let error = false;
        if (e.target.value === '') {
            error = true;
        }
        this.setState({
            ...this.state,
            currentQuestion: {...this.state.currentQuestion, answers: ans},
            errors: {
                ...this.state.errors,
                answers: error
            }
        }, () => {
            this.checkFormValidation();
        });
    };

    handleChangeTitle = e => {
        let error=false;
        if(e.target.value===''){
            error=true;
        }
        this.setState({
            ...this.state,
            title: e.target.value,
            errors:{
                ...this.state.errors,
                title: error
            }
        }, () => {
            this.checkFormValidation();
        });
    };

    handleChangeQues = e => {
        let error=false;
        if(e.target.value===''){
            error=true;
        }
        this.setState({
            ...this.state,
            errors:{
                ...this.state.errors,
                question: error
            },
            currentQuestion: {
                ...this.state.currentQuestion,
                question: e.target.value
            }
        }, () => {
            this.checkFormValidation();
        });
    };

    handleRemoveAns = () => {
        const {currentQuestion} = this.state;
        const {answers} = currentQuestion;
        if (answers.length > 2) {
            answers.pop();
            this.setState(
                {currentQuestion: {...currentQuestion, answers: answers}},
                () => {
                    this.checkFormValidation();
                }
            )
        }
    };

    handleNewAns = () => {
        const {currentQuestion} = this.state;
        this.setState(
            {currentQuestion: {...currentQuestion, answers: [...this.state.currentQuestion.answers, '']}},
            () => {
                this.checkFormValidation();
            }
        )
    };

    handleNewEvent = event => {
        event.preventDefault();
    };

    saveCurrentForm = () => {
        this.checkFormValidation();

        if (this.state.isFormValid) {
            const {currentQuestionNo, noOfQuestions} = this.state;
            const {question, answers, correctAns} = this.state.currentQuestion;
            // let correctAns = answers[0];
            let id = currentQuestionNo;

            let correct= answers[0];
            if(this.state.edit) correct= correctAns


            let Ques = {
                id: id,
                answers: answers,
                question: question,
                correctAns: correct
            };


            if (currentQuestionNo > noOfQuestions) {
                this.setState({
                    ...this.state,
                    questions: [
                        ...this.state.questions,
                        Ques
                    ],
                    noOfQuestions: id,
                    currentQuestionNo: id + 1,
                    currentQuestion: {
                        id: id + 1,
                        question: "",
                        answers: ['', ''],
                    }
                });
            }
            else {
                const {questions} = this.state;
                let index = currentQuestionNo;
                
                const updatedQuestions = questions.map((ques, i) => (
                    ques.id === index ? Ques : ques
                ));
                if (currentQuestionNo === noOfQuestions) {
                    this.setState({
                        ...this.state,
                        questions: updatedQuestions,
                        currentQuestionNo: currentQuestionNo + 1,
                        currentQuestion: {
                            id: currentQuestionNo + 1,
                            question: '',
                            answers: ['', ''],
                        }
                    });
                } else {
                    const {question, answers, correctAns} = this.state.questions[index];
                    // console.log(this.state.questions[index]);
                    // console.log(answers);
                    // console.log(correctAns);

                    let correct= correctAns;

                    if(correctAns===''){
                        correct= answers[0];
                    }
                    

                    this.setState({
                        ...this.state,
                        questions: updatedQuestions,
                        currentQuestionNo: index + 1,
                        currentQuestion: {
                            id: index + 1,
                            question: question,
                            answers: answers,
                            correctAns: correct
                        }
                    },()=>{
                        // console.log(this.state.currentQuestion);
                    });
                }
            }
        }
    };

    checkFormValidation = () => {
        const {currentQuestion, title} = this.state;
        const {question, answers} = currentQuestion;
        let isFormValid = true;

        if (question === '') {
            isFormValid = false;
        }

        if (title === '') {
            isFormValid = false;
        }

        answers.map((ans, i) => {
            if (ans === '') {
                isFormValid = false;
            }
        });

        this.setState({
            ...this.state,
            isFormValid: isFormValid
        })
    };

    submitExercise = () => {
        let id= this.state.id;
        if(this.state.id === -1){
            id= this.props.counter;
        }

        let exercise = {
            title: this.state.title,
            id:id,
            type: "MCQ",
            questions: this.state.questions,
            scores: this.state.scores,
            times: this.state.times
        };

        if(this.state.edit){
            this.props.editExercise(exercise);
        }else{
            this.props.addNewExercise(exercise);
            this.props.incrementExerciseCounter();
        }
        this.props.history.push('/')
    };

    previousQues = () => {
        const {currentQuestionNo} = this.state;
        let previousQuestionNo = currentQuestionNo - 1;

        let previousQuestion = this.state.questions[previousQuestionNo - 1];
        const {id, question, answers} = previousQuestion;
        let currentQuestion = {
            id: id,
            question: question,
            answers: answers
        };

        this.setState({
            ...this.state,
            currentQuestionNo: id,
            currentQuestion: currentQuestion
        })
    };

    render() {
        const {currentQuestion, errors} = this.state;
        const {id} = currentQuestion;
        let inputs = currentQuestion.answers.map((ans, i) => {
            let placeholder_string = WRONG_OPTION;
            if (i === 0) placeholder_string = CORRECT_OPTION;
            return (
                <div className="row" key={`answers-${i}`}>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor={`answer-${i}`}>
                                {i + 1}
                            </label>
                            <FormattedMessage id={placeholder_string}>
                                {placeholder => <input
                                    className="answers input-ans"
                                    name={`answer-${i}`}
                                    type="text"
                                    value={ans}
                                    required
                                    placeholder={placeholder}
                                    onChange={this.handleChangeAns}/>}
                            </FormattedMessage>
                        </div>
                    </div>
                </div>
            )
        });
        let title_error = '';
        let question_error = '';
        let answer_error = '';

        if (errors['title']) {
            title_error = <span style={{color: "red"}}>Title field can't be empty</span>;
        }
        if (errors['question']) {
            question_error = <span style={{color: "red"}}>Question field can't be empty</span>;
        }
        if (errors['answers']) {
            answer_error = <span style={{color: "red"}}>Answers field can't be empty</span>;
        }

        return (
            <div className="container-fluid">
                <div className="row align-items-center justify-content-center">
                    <div className="col-sm-10">
                        <div className="col-md-12">
                            <form onSubmit={this.handleNewEvent}>
                                <div className="row">
                                    <div className="form-group">
                                        <label htmlFor="title"><FormattedMessage id={TITLE_OF_EXERCISE}/></label>
                                        <input
                                            className="input-mcq"
                                            type="text"
                                            id="title"
                                            required
                                            value={this.state.title}
                                            onChange={this.handleChangeTitle}
                                        />
                                        {title_error}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="form-group">
                                        <label htmlFor="question">{id}. <FormattedMessage id={QUESTION}/>:</label>
                                        <input
                                            className="input-mcq"
                                            type="text"
                                            id="question"
                                            required
                                            value={this.state.currentQuestion.question}
                                            onChange={this.handleChangeQues}
                                        />
                                        {question_error}
                                    </div>
                                </div>
                                {inputs}
                                <div>
                                    {answer_error}
                                </div>
                                <div className="row">
                                    <div className="form-group">
                                        <button
                                            type="button"
                                            onClick={this.handleNewAns}
                                            className="btn button-choices-add">

                                        </button>
                                        <button
                                            type="button"
                                            onClick={this.handleRemoveAns}
                                            className="btn button-choices-sub">

                                        </button>
                                    </div>
                                </div>
                                <div className="form-group row justify-content-between">
                                    <button
                                        onClick={this.previousQues}
                                        className={"btn button-previous"}
                                        disabled={this.state.currentQuestionNo === 1}
                                    >
                                        <FormattedMessage id={PREVIOUS}/> <FormattedMessage id={QUESTION}/>
                                    </button>
                                    <div className="justify-content-end">
                                        <button
                                            onClick={this.saveCurrentForm}
                                            className={"btn button-next"}
                                            disabled={!this.state.isFormValid}
                                        >
                                            <FormattedMessage id={NEXT}/> <FormattedMessage id={QUESTION}/>
                                        </button>
                                        <button
                                            onClick={this.submitExercise}
                                            className={"btn button-finish"}
                                            disabled={!this.state.noOfQuestions >= 1}
                                        >
                                            <FormattedMessage id={FINISH_EXERCISE}/>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function MapStateToProps(state) {
    return {
        counter: state.exercise_counter
    }
}

export default withRouter(
    connect(MapStateToProps,
    {addNewExercise, incrementExerciseCounter, editExercise}
    )(MCQForm));