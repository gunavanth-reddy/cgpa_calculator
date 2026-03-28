import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export default function UGApp() {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState(null);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [subjects, setSubjects] = useState([{ credits: "", grade: "O" }]);
  const [result, setResult] = useState(null);

  const [currentCGPA, setCurrentCGPA] = useState("");
  const [completedCredits, setCompletedCredits] = useState("");

  const [targetCGPA, setTargetCGPA] = useState("");
  const [targetSem, setTargetSem] = useState("");
  const [completedSem, setCompletedSem] = useState("");
  const [advice, setAdvice] = useState("");

  const gradePoints = {
    O: 10,
    "A+": 9,
    A: 8,
    "B+": 7,
    B: 6,
    C: 5,
    F: 0,
  };

  const saveData = async (type, data, resultVal, adviceVal = "") => {
    try {
      await addDoc(collection(db, "records"), {
        name,
        roll,
        type,
        data,
        result: resultVal,
        advice: adviceVal,
        createdAt: new Date()
      });
    } catch (err) {
      console.error(err);
    }
  };

  const resetAll = () => {
    setSubjects([{ credits: "", grade: "O" }]);
    setResult(null);
    setAdvice("");
    setCurrentCGPA("");
    setCompletedCredits("");
    setTargetCGPA("");
    setTargetSem("");
    setCompletedSem("");
  };

  const goHome = () => {
    resetAll();
    setMode(null);
    setStep(2);
  };

  const addSubject = () => {
    setSubjects([...subjects, { credits: "", grade: "O" }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  // ✅ SGPA
  const calculateSGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    subjects.forEach((sub) => {
      const c = parseFloat(sub.credits);
      const g = gradePoints[sub.grade];
      if (!isNaN(c)) {
        totalPoints += c * g;
        totalCredits += c;
      }
    });

    if (totalCredits === 0) return alert("Enter valid data");

    const res = (totalPoints / totalCredits).toFixed(2);
    setResult(res);
    saveData("sgpa", subjects, res);
  };

  // ✅ CGPA (correct logic)
  const calculateCGPA = () => {
    if (!currentCGPA || !completedCredits) {
      return alert("Enter current CGPA & credits");
    }

    let newPoints = 0;
    let newCredits = 0;

    subjects.forEach((sub) => {
      const c = parseFloat(sub.credits);
      const g = gradePoints[sub.grade];

      if (!isNaN(c)) {
        newPoints += c * g;
        newCredits += c;
      }
    });

    if (newCredits === 0) return alert("Enter subjects");

    const totalPoints =
      parseFloat(currentCGPA) * parseFloat(completedCredits) + newPoints;

    const totalCredits =
      parseFloat(completedCredits) + newCredits;

    const res = (totalPoints / totalCredits).toFixed(2);

    setResult(res);

    saveData("cgpa", { subjects, currentCGPA, completedCredits }, res);
  };

  const calculateTarget = () => {
  if (!currentCGPA || !completedSem || !targetSem || !targetCGPA) {
    return alert("Fill all fields");
  }

  const semsLeft = targetSem - completedSem;
  if (semsLeft <= 0) return alert("Invalid sem");

  const neededAvg = (
    (targetCGPA * targetSem - currentCGPA * completedSem) /
    semsLeft
  ).toFixed(2);

  // 🔥 Improved Tips
  let tips =
    neededAvg >= 9
      ? "🚀 You need top performance.\n• Aim O in almost all subjects\n• Focus on internals\n• Avoid even one low grade"
      : neededAvg >= 8
      ? "👍 Strong target.\n• Aim for A+ consistently\n• Practice PYQs\n• Don’t lose marks in labs"
      : neededAvg >= 7
      ? "🙂 Moderate target.\n• Be consistent\n• Attend all classes\n• Improve weak subjects"
      : "😌 Easy target.\n• Avoid F grades\n• Stay regular\n• Maintain basics";

  const strategy =
    "🎯 Smart Strategy:\n" +
    "• Study 2–3 hrs daily\n" +
    "• Focus more on high-credit subjects\n" +
    "• Revise weekly\n" +
    "• Use PYQs (important)\n" +
    "• Score well in internals";

  const bonus =
    "⚡ Pro Tips:\n" +
    "• 4 credit subjects impact CGPA more\n" +
    "• Improve high-credit subjects first\n" +
    "• Don’t ignore attendance\n" +
    "• Avoid backlogs at any cost";

  const motivation =
    "🔥 Consistency beats motivation\n💯 Small daily effort = big CGPA jump";

  const adv = `Hi ${name} 👋

You need ${neededAvg} SGPA from Sem ${parseInt(completedSem) + 1} to ${targetSem}

${tips}

${strategy}

${bonus}

${motivation}`;

  setAdvice(adv);

  saveData(
    "target",
    { currentCGPA, completedSem, targetSem, targetCGPA },
    "",
    adv
  );
};

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>

        <img
          src="https://www.slashfilm.com/img/gallery/the-extreme-lengths-brad-pitt-went-to-for-his-fight-club-role/l-intro-1631539645.jpg"
          alt="UG Logo"
          style={logoStyle}
        />

        <div style={titleContainer}>
          <h2 style={mainTitle}>
            {step === 1 ? "UG-Updates Guru" : `Hi ${name} 👋`}
          </h2>
          {step === 1 && (
            <p style={subTitle}>SRM AP GPA Calculator</p>
          )}
        </div>

        {step === 1 && (
          <div>
            <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} style={inputStyle}/>
            <input placeholder="Roll (AP...)" value={roll} onChange={(e)=>setRoll(e.target.value)} style={inputStyle}/>

            <button style={primaryBtn} onClick={()=>{
              if(!name||!roll) return alert("Fill all");
              if(!roll.startsWith("AP")) return alert("Roll must start with AP");
              setStep(2);
            }}>Continue →</button>
          </div>
        )}

        {step === 2 && !mode && (
          <div>
            <button onClick={()=>setMode("sgpa")} style={primaryBtn}>SGPA Calculator</button>
            <button onClick={()=>setMode("cgpa")} style={primaryBtn}>CGPA Calculator</button>
            <button onClick={()=>setMode("target")} style={trendingBtn}>🔥 Target CGPA Planner</button>
          </div>
        )}

        {mode === "target" && (
          <div>
            <input placeholder="Current CGPA" value={currentCGPA} onChange={(e)=>setCurrentCGPA(e.target.value)} style={inputStyle}/>
            <input placeholder="Completed Sem" value={completedSem} onChange={(e)=>setCompletedSem(e.target.value)} style={inputStyle}/>
            <input placeholder="Target Sem" value={targetSem} onChange={(e)=>setTargetSem(e.target.value)} style={inputStyle}/>
            <input placeholder="Target CGPA" value={targetCGPA} onChange={(e)=>setTargetCGPA(e.target.value)} style={inputStyle}/>

            <button onClick={calculateTarget} style={primaryBtn}>Get Advice</button>
            {advice && <p style={resultStyle}>{advice}</p>}

            <button onClick={resetAll} style={secondaryBtn}>Reset</button>
            <button onClick={goHome} style={secondaryBtn}>Home</button>
          </div>
        )}

        {(mode === "sgpa" || mode === "cgpa") && (
          <div>

            {/* ✅ CGPA Inputs */}
            {mode === "cgpa" && (
              <>
                <input
                  placeholder="Current CGPA"
                  value={currentCGPA}
                  onChange={(e)=>setCurrentCGPA(e.target.value)}
                  style={inputStyle}
                />
                <input
                  placeholder="Total Credits till current CGPA"
                  value={completedCredits}
                  onChange={(e)=>setCompletedCredits(e.target.value)}
                  style={inputStyle}
                />
              </>
            )}

            {subjects.map((sub,index)=>(
              <div key={index}>
                <input placeholder="Credits" value={sub.credits} onChange={(e)=>handleChange(index,"credits",e.target.value)} style={inputStyle}/>
                <select value={sub.grade} onChange={(e)=>handleChange(index,"grade",e.target.value)} style={inputStyle}>
                  {Object.keys(gradePoints).map(g=>(<option key={g}>{g}</option>))}
                </select>
              </div>
            ))}

            <button onClick={addSubject} style={secondaryBtn}>+ Subject</button>

            {mode === "sgpa" && <button onClick={calculateSGPA} style={primaryBtn}>Calculate</button>}
            {mode === "cgpa" && <button onClick={calculateCGPA} style={primaryBtn}>Calculate</button>}

            {result && <h3 style={resultStyle}>🎯 {result}</h3>}

            <button onClick={resetAll} style={secondaryBtn}>Reset</button>
            <button onClick={goHome} style={secondaryBtn}>Home</button>
          </div>
        )}

      </div>
    </div>
  );
}

/* styles same as before */

/* STYLES */

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "radial-gradient(circle at top, #1e1b4b, #020617)",
};

const cardStyle = {
  background: "rgba(17, 24, 39, 0.75)",
  color: "white",
  padding: "25px",
  borderRadius: "20px",
  width: "100%",
  maxWidth: "380px",
  textAlign: "center",
  boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
  backdropFilter: "blur(15px)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const logoStyle = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  objectFit: "cover",
  marginBottom: "10px",
};

const titleContainer = {
  marginBottom: "20px",
};

const mainTitle = {
  fontSize: "26px",
  fontWeight: "700",
  color: "#ffffff",
  marginBottom: "6px",
};

const subTitle = {
  fontSize: "14px",
  color: "#9ca3af",
  letterSpacing: "1px",
};

const primaryBtn = {
  margin: "6px 0",
  padding: "12px",
  width: "100%",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  boxShadow: "0 0 15px rgba(99,102,241,0.6)",
};

const trendingBtn = {
  margin: "6px 0",
  padding: "12px",
  width: "100%",
  borderRadius: "10px",
  border: "none",
  background: "#ef4444",
  color: "white",
  fontWeight: "bold",
};

const secondaryBtn = {
  margin: "6px 0",
  padding: "10px",
  width: "100%",
  borderRadius: "10px",
  border: "1px solid #374151",
  background: "#1f2937",
  color: "white",
};

const inputStyle = {
  margin: "6px 0",
  padding: "10px",
  width: "100%",
  borderRadius: "10px",
  border: "1px solid #374151",
  background: "#1f2937",
  color: "white",
};

const resultStyle = {
  marginTop: "10px",
  fontWeight: "bold",
};

