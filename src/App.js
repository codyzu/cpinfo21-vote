import "bootswatch/dist/vapor/bootstrap.min.css";

import { Container, Row, Col, Progress, Button } from "reactstrap";
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

const provider = new GoogleAuthProvider();
const auth = getAuth(app);
const db = getFirestore(app);

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

  return (
    <Container className="min-vh-100">
      <Row className="justify-content-end">
        <Col className="text-end fs-4 align-middle">{user && user.email}</Col>
        <Col xs="auto">
          <Button
            onClick={
              user
                ? () => signOut(auth)
                : () => signInWithRedirect(auth, provider)
            }
            color={user ? "secondary" : "success"}
          >
            {user ? "Logout" : "Login"}
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>Vote:</Col>
      </Row>
      <Row>
        <Col>Here</Col>
        <Col>Here</Col>
      </Row>
      <Row>
        <Col>
          <Progress multi style={{ height: "100px" }}>
            <Progress
              animated
              bar
              value={exam}
              max={exam + hackathon}
              color="danger"
            >
              Exam {exam}
            </Progress>
            <Progress
              animated
              bar
              value={hackathon}
              max={exam + hackathon}
              color="success"
            >
              Hackathon {hackathon}
            </Progress>
          </Progress>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button
            disabled={
              !user || !user.email.endsWith("iut-acy.univ-smb.fr") || vote?.exam
            }
            onClick={() =>
              setDoc(doc(db, votePath), { exam: true, hackathon: false })
            }
          >
            Exam
          </Button>
          <Button
            disabled={
              !user ||
              !user.email.endsWith("iut-acy.univ-smb.fr") ||
              vote?.hackathon
            }
            onClick={() =>
              setDoc(doc(db, votePath), { exam: false, hackathon: true })
            }
          >
            Hackathon
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
