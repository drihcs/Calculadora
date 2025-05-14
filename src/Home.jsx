import { useState, useEffect } from "react"

function Home() {
  const [currentOperand, setCurrentOperand] = useState("0")
  const [previousOperand, setPreviousOperand] = useState("")
  const [operation, setOperation] = useState(null)
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false)
  const [history, setHistory] = useState("")
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light")

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  const appendNumber = (number) => {
    if (number === "." && currentOperand.includes(".")) return

    if (shouldResetDisplay) {
      setCurrentOperand(number)
      setShouldResetDisplay(false)
      return
    }

    if (currentOperand === "0" && number !== ".") {
      setCurrentOperand(number)
    } else {
      setCurrentOperand((prev) => prev + number)
    }
  }

  const chooseOperation = (op) => {
    if (currentOperand === "0" && previousOperand === "") return

    if (previousOperand !== "") {
      calculate()
    }

    setOperation(op)
    setPreviousOperand(currentOperand)
    setShouldResetDisplay(true)

    // Update history
    const operationSymbol = getOperatorSymbol(op)
    setHistory(`${currentOperand} ${operationSymbol}`)
  }

  const calculate = () => {
    if (operation === null || shouldResetDisplay) return

    const prev = Number.parseFloat(previousOperand)
    const current = Number.parseFloat(currentOperand)

    if (isNaN(prev) || isNaN(current)) return

    let result

    switch (operation) {
      case "+":
        result = prev + current
        break
      case "-":
        result = prev - current
        break
      case "*":
        result = prev * current
        break
      case "/":
        if (current === 0) {
          setCurrentOperand("Error")
          setPreviousOperand("")
          setOperation(null)
          setHistory("")
          return
        }
        result = prev / current
        break
      default:
        return
    }

    // Update history
    const operationSymbol = getOperatorSymbol(operation)
    setHistory(`${previousOperand} ${operationSymbol} ${currentOperand} =`)

    setCurrentOperand(formatNumber(result))
    setOperation(null)
    setPreviousOperand("")
  }

  const clear = () => {
    setCurrentOperand("0")
    setPreviousOperand("")
    setOperation(null)
    setHistory("")
    setShouldResetDisplay(false)
  }

  const backspace = () => {
    if (currentOperand === "0" || currentOperand === "Error" || shouldResetDisplay) return

    if (currentOperand.length === 1) {
      setCurrentOperand("0")
    } else {
      setCurrentOperand((prev) => prev.slice(0, -1))
    }
  }

  const percent = () => {
    const current = Number.parseFloat(currentOperand)
    if (isNaN(current)) return

    setCurrentOperand(formatNumber(current / 100))
  }

  const squareRoot = () => {
    const current = Number.parseFloat(currentOperand)
    if (isNaN(current) || current < 0) {
      setCurrentOperand("Error")
      return
    }

    setCurrentOperand(formatNumber(Math.sqrt(current)))
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event

      // Numbers
      if (/^[0-9]$/.test(key)) {
        event.preventDefault()
        appendNumber(key)
      }
      // Decimal point
      else if (key === ".") {
        event.preventDefault()
        appendNumber(".")
      }
      // Operations
      else if (["+", "-", "*", "/"].includes(key)) {
        event.preventDefault()
        chooseOperation(key)
      }
      // Calculate
      else if (key === "Enter" || key === "=") {
        event.preventDefault()
        calculate()
      }
      // Clear
      else if (key === "Escape" || key === "c" || key === "C") {
        event.preventDefault()
        clear()
      }
      // Backspace
      else if (key === "Backspace") {
        event.preventDefault()
        backspace()
      }
      // Percent
      else if (key === "%") {
        event.preventDefault()
        percent()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [currentOperand, previousOperand, operation, shouldResetDisplay])

  return (
    <div className="container" data-theme={theme}>
      <div className="calculator">
        <div className="calculator-header">
          <h1>Calculadora</h1>
          <button id="theme-toggle" className="theme-toggle" aria-label="Alternar tema" onClick={toggleTheme}>
            <span className="material-icons light-icon">light_mode</span>
            <span className="material-icons dark-icon">dark_mode</span>
          </button>
        </div>
        <div className="calculator-history">
          <div id="history-display" className="history-display">
            {history}
          </div>
        </div>
        <div className="calculator-display">
          <div id="display" className="display">
            {currentOperand}
          </div>
        </div>

        <div className="calculator-buttons">
          <button className="btn btn-clear" data-action="clear" onClick={clear}>C</button>
          <button className="btn btn-operation" data-action="backspace" onClick={backspace}>
            <span className="material-icons">backspace</span>
          </button>
          <button className="btn btn-operation" data-action="percent" onClick={percent}>%</button>
          <button className="btn btn-operation" data-operation="/" onClick={() => chooseOperation("/")}>÷</button>

          <button className="btn" data-number={7} onClick={() => appendNumber("7")}>7</button>
          <button className="btn" data-number={8} onClick={() => appendNumber("8")}>8</button>
          <button className="btn" data-number={9} onClick={() => appendNumber("9")}>9</button>
          <button className="btn btn-operation" data-operation="*" onClick={() => chooseOperation("*")}>×</button>

          <button className="btn" data-number={4} onClick={() => appendNumber("4")}>4</button>
          <button className="btn" data-number={5} onClick={() => appendNumber("5")}>5</button>
          <button className="btn" data-number={6} onClick={() => appendNumber("6")}>6</button>
          <button className="btn btn-operation" data-operation="-" onClick={() => chooseOperation("-")}>−</button>

          <button className="btn" data-number={1} onClick={() => appendNumber("1")}>1</button>
          <button className="btn" data-number={2} onClick={() => appendNumber("2")}>2</button>
          <button className="btn" data-number={3} onClick={() => appendNumber("3")}>3</button>
          <button className="btn btn-operation" data-operation="+" onClick={() => chooseOperation("+")}>+</button>

          <button className="btn btn-operation" data-action="sqrt" onClick={squareRoot}>√</button>
          <button className="btn" data-number={0} onClick={() => appendNumber("0")}>0</button>
          <button className="btn" data-number="." onClick={() => appendNumber(".")}>.</button>
          <button className="btn btn-equals" data-action="calculate" onClick={calculate}>=</button>
        </div>
      </div>
    </div>
  )
}

// Utility functions
function formatNumber(number) {
  const stringNumber = number.toString()
  const integerDigits = Number.parseFloat(stringNumber.split(".")[0])
  const decimalDigits = stringNumber.split(".")[1]

  const integerDisplay = isNaN(integerDigits) ? "0" : integerDigits.toLocaleString("en", { maximumFractionDigits: 0 })

  if (decimalDigits != null) {
    return `${integerDisplay}.${decimalDigits}`
  } else {
    return integerDisplay
  }
}

function getOperatorSymbol(operator) {
  switch (operator) {
    case "+":
      return "+"
    case "-":
      return "−"
    case "*":
      return "×"
    case "/":
      return "÷"
    default:
      return operator
  }
}

export default Home