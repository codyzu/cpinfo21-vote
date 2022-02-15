import "bootswatch/dist/quartz/bootstrap.min.css";

import {
  Container,
  Row,
  Col,
  Progress,
  Button,
  Card,
  CardHeader,
  CardBody,
} from "reactstrap";
import app from "./firebase";
import {
  getAuth,
  signInWithRedirect,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  doc,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import emailList from "./email.json";

const provider = new GoogleAuthProvider();
const auth = getAuth(app);
const db = getFirestore(app);

const emailRegExps = emailList.emails.map(
  (email) => new RegExp(email.replace(".", "\\."))
);

function App() {
  const [user, setUser] = useState(null);
  useEffect(
    () =>
      onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser);
      }),
    []
  );

  const [exam, setExam] = useState(0);
  const [hackathon, setHackathon] = useState(0);
  useEffect(() => {
    onSnapshot(query(collection(db, "votes")), (snapshot) => {
      const data = snapshot.docs.map((d) => d.data());
      setExam(data.filter((d) => d.exam).length);
      setHackathon(data.filter((d) => d.hackathon).length);
    });
  }, []);

  const votePath = `votes/${user?.uid}`;

  const [vote, setVote] = useState({ exam: false, hackathon: false });
  useEffect(() => {
    if (!user) {
      return;
    }
    return onSnapshot(doc(db, votePath), (snapshot) => {
      console.log("VOTE", snapshot.data());
      setVote(snapshot.data());
    });
  }, [user, votePath]);

  const canVote =
    user && emailRegExps.some((regExp) => regExp.test(user.email));

  return (
    <Container className="min-vh-100 mt-3">
      <Row className="justify-content-end">
        <Col className="d-flex justify-content-end align-items-center">
          {user && user.email}
        </Col>
        <Col xs="auto">
          {user ? (
            <Button onClick={() => signOut(auth)} color="danger">
              Logout
            </Button>
          ) : (
            <Button
              onClick={() => signInWithRedirect(auth, provider)}
              color="success"
            >
              Login
            </Button>
          )}
        </Col>
      </Row>
      <Row className="mt-4">
        <Col className="text-center">
          <h1>CPINFO-21 Final Exam Vote</h1>
        </Col>
      </Row>
      <Row className="">
        <Col xs={4}>
          <Row>
            <Col>Exam</Col>
          </Row>
          <Row>
            <Col>{exam}</Col>
          </Row>
        </Col>
        <Col xs={4}>
          <Row className="text-center">
            <Col>Total</Col>
          </Row>
          <Row className="text-center">
            <Col>{exam + hackathon}</Col>
          </Row>
        </Col>
        <Col xs={4}>
          <Row>
            <Col className="text-end">Hackathon</Col>
          </Row>
          <Row>
            <Col className="text-end">{hackathon}</Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col>
          <Progress multi style={{ height: "100px" }}>
            <Progress
              animated
              bar
              value={exam}
              max={exam + hackathon}
              color="primary"
            >
              <h6>Exam {exam}</h6>
            </Progress>
            <Progress
              animated
              bar
              value={hackathon}
              max={exam + hackathon}
              color="info"
            >
              <h6>Hackathon {hackathon}</h6>
            </Progress>
          </Progress>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col></Col>
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="border-success">
            <CardHeader className="text-center">Cast your vote</CardHeader>
            <CardBody>
              <Container fluid>
                <Row>
                  <Col>
                    <Button
                      className="w-100"
                      onClick={() =>
                        setDoc(doc(db, votePath), {
                          exam: true,
                          hackathon: false,
                          email: user.email,
                        })
                      }
                      active={!vote?.exam}
                      disabled={!canVote}
                      color={vote?.exam ? "success" : "secondary"}
                    >
                      Exam
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      className="w-100"
                      onClick={() =>
                        setDoc(doc(db, votePath), {
                          exam: false,
                          hackathon: true,
                          email: user.email,
                        })
                      }
                      active={!vote?.hackathon}
                      disabled={!canVote}
                      color={vote?.hackathon ? "success" : "secondary"}
                    >
                      Hackathon
                    </Button>
                  </Col>
                </Row>
              </Container>
            </CardBody>
          </Card>
        </Col>
        <Col></Col>
      </Row>
    </Container>
  );
}

export default App;
