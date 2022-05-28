import React, {Fragment, useEffect, useState} from "react";
import {Card, Container, Modal, Row} from "react-bootstrap";
import {SessionForm} from "./SessionForm";
import {QuizCard} from "../Quizzes/QuizCard";
import {CreateEditQuizModal} from "../Quizzes/CreateEditQuizModal";
import {goGET, goPOST} from "../../Services/FetchService";
import {useParams} from "react-router";
import {getActionHref, getLinksHref} from "../../Services/SirenService";
import Button from "react-bootstrap/Button";
import {QuizCardInSession} from "../Quizzes/QuizCardInSession";
import SockJsClient from 'react-stomp';

/* register websocket */


export const InSessionOrg = () => {
    const [loading, setLoading] = useState(false)
    const [session, setSession] = useState(null)
    const [quizzes, setQuizzes] = useState(null)
    const [answers, setAnswers] = useState(null)
    const [numberParticipants, setNumberParticipants] = useState(0)
    const [quizzesLinks, setQuizzesLinks] = useState(null)
    const [show, setShow] = useState(false)
    const [error, setError] = useState(null)
    const [title, setTitle] = useState(null)
    const [guestCode, setGuestCode] = useState(null)
    const [client, setClient] = useState(null)
    const {id} = useParams()

    useEffect(() => {
        /*Prevent reset state*/
        const setSessionError = (error) => {
            if (error !== null) {
                console.log(`Failed to get session with ID: ${id} with error ${error}`)
                setError(error)
            }
        }
        const getMeSession = (data) => {
            setSession(data)
        }
        /* console.log(`Session Id: ${id}`)*/
        goGET(`/api/web/v1.0/auth/sessions/${id}`, getMeSession, setSessionError)

    }, [id])

    useEffect(() => {
        if (session !== null) {
            setTitle(session.properties.name)
            setGuestCode(session.properties.guestCode)
            getQuizzes()
            getAnswers()

        }
    }, [session])

    /*
        useEffect(() => {
            if (quizzes !== null) {
                getAnswers()

            }
        }, [quizzes])
    */

    const getQuizzes = () => {
        const setError = (error) => {
            if (error !== null)
                alert(`Failed to retrieve Session from ${getLinksHref(session.links, "related")} with error ${error}`)
        }

        const compareOrder = (a, b) => {
            if (a < b) return -1
            if (a > b) return 1
            return 0
        }

        const setData = (data) => {
            if (data) {
                const quizList = data.entities.map(e => e)
                const t = quizList.sort((a, b) => compareOrder(a.properties.order, b.properties.order))
                setQuizzes(t)
            }
        }
        goGET(getLinksHref(session.links, "related", 'Quizzes'), setData, setError)
    }

    const getAnswers = () => {
        const setError = (error) => {
            if (error !== null)
                alert(`Failed to retrieve Session from ${getLinksHref(session.links, "related")} with error ${error}`)
        }

        const setData = (data) => {
            if (data) {
                setAnswers(data.entities)
                setNumberParticipants(data.properties.total)
            }
        }
        goGET(getLinksHref(session.links, "related", 'Answers'), setData, setError)
    }


    const newQuiz = () => {
        setShow(true)
    }
    const handleClose = () => {
        setShow(false)
    }

    const newButton = () => (
        <Button className="btn btn-success mb-3 mt-3" type="submit"
                onClick={newQuiz}> Add Quiz
        </Button>
    )

    const createQuizHandler = (quiz) => {
        const setError = (error) => error !== null ? console.log(`Error Creating with error ${error} `) : null
        const setData = (data) => {
            console.log(`Created Quiz Successfully!! Response: ${data}`)
            handleClose()
            getQuizzes()
        }
        const apiLink = session.actions.find(a => a.name === 'Add-Quiz').href
        goPOST(apiLink, quiz, setData, setError)

    }

    const updateSessionHandler = (updatedSession) => {
        setLoading(true)
        const setError = (error) => {
            if (error !== null)
                alert(`Failed to update Session from ${updatedSession} with error ${error}`)
        }

        const apiLink = getActionHref(session.actions, 'Update-Session')
        //const method = session.actions.find(a => a.name === 'Update-Session').method //TODO: getMethod

        goPOST(apiLink, updatedSession, null, setError, 'PUT', setLoading)
    }

    const getQuizAnswers = (id) => {
        const ans = [];
        if (answers != null && answers[0] != null) {
            answers.forEach(aw =>
                aw.properties.answers.forEach(a => {
                    if (a.quizId === id) {
                        ans.push(a)
                    }
                })
            )
        }
        return ans
    }

    const sendTestMessage = () => {
        client.sendMessage(`/app/insession/${id}`, JSON.stringify({
            name: 'Test Name',
            message: 'TEst MEssage'
        }));
    }

    const testButton = () => (
        <Button className="btn btn-success mb-3 mt-3"
                onClick={sendTestMessage}> Send Test MEssage
        </Button>
    )

    return (
        <Fragment>
            <Container>
                <Row>
                    <Card className={"mt-3"}>
                        <Card.Title>{title} - Session Code: {guestCode} - Number of
                            Participants: {numberParticipants}</Card.Title>
                        {/*
                            <Card.Body>
                           {session !== null && (
                                <SessionForm session={session.properties} updateSession={updateSessionHandler}/>)}
                        </Card.Body>*/}
                    </Card>
                </Row>
            </Container>
            {/******************** if there are quizzes *********************************/}

            <Container>
                <Row>
                    {testButton()}
                </Row>
                <Row>
                    {newButton()}
                </Row>
            </Container>
            <Container>
                <Row>
                    {quizzes !== null && quizzes.length > 0 && (
                        quizzes.map(q => <QuizCardInSession key={q.properties.id}
                                                            name={q.properties.question}
                                                            data={q.properties}
                                                            quizHref={q.href}
                                                            reloadQuizzes={getQuizzes}
                                                            answers={getQuizAnswers(q.properties.id)}
                                                            sendTestMessage={sendTestMessage}
                        />)
                    )}
                </Row>
            </Container>

            <Modal show={show}>
                <CreateEditQuizModal handleClose={handleClose} createQuiz={createQuizHandler}/>
            </Modal>

            {session !== null && <SockJsClient url='http://localhost:8080/insession/'
                          topics={[`/topic/orginsession/${id}`]}
                          onConnect={() => {
                              console.log("connected");
                              console.log(`/app/insession/${id}`)
                          }}
                          onDisconnect={() => {
                              console.log("Disconnected");
                          }}
                          onMessage={(msg) => {
                              console.log(msg);
                          }}
                          ref={(client) => {
                              setClient(client)
                          }}/>}
        </Fragment>
    )
}