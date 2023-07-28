import { Container, Row, Col, Button, Stack, Tooltip, Overlay } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { useDebounce } from './hooks/useDebounce'
import { useStore } from './hooks/useStore'
import { AUTO_LANGUAGE, VOICE_FOR_LANGUAGE } from './constants'
import { ArrowsIcon, ClipboardIcon, SpeakerIcon } from './components/Icons'
import { TextArea } from './components/TextArea'
import { LanguageSelector } from './components/LanguageSelector'
import { SectionType } from './types.d'
import { useEffect, useState, useRef } from 'react'
import { translate } from './services/translate'

function App () {
  const { loading, fromLanguage, toLanguage, fromText, result, interChangeLanguages, setFromLanguage, setToLanguage, setFromText, setResult } = useStore()
  const [show, setShow] = useState(false)
  const target = useRef(null)

  const deboucedFromText = useDebounce(fromText, 400)

  const handleTranslate = async () => {
    try {
      const dataResponse = await translate({ fromLanguage, toLanguage, text: deboucedFromText })
      if (dataResponse == null) return
      setResult(dataResponse)
    } catch (error) {
      console.log(error)
      setResult('Error')
    }
  }

  const handleClipboard = () => {
    if (result == null || result === '') return false
    navigator.clipboard.writeText(result).catch(() => {})
    setShow(true)
    setTimeout(() => {
      setShow(false)
    }, 800)
  }

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(result)
    utterance.lang = VOICE_FOR_LANGUAGE[toLanguage]
    utterance.rate = 0.9
    speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (deboucedFromText === '') return
    handleTranslate()
  }, [deboucedFromText, fromLanguage, toLanguage])

  return (
    <Container fluid>
      <h1>Google Translate</h1>
      <br/>
      <Row>
        <Col>
          <Stack gap={2}>
            <LanguageSelector
              value={fromLanguage}
              type={SectionType.From}
              onChange={setFromLanguage}
            />
            <TextArea
              loading={loading}
              type={SectionType.From}
              value={fromText}
              onChange={setFromText}
            />
          </Stack>
        </Col>
        <Col>
          <Button variant='link' disabled={fromLanguage === AUTO_LANGUAGE} onClick={interChangeLanguages}>
           <ArrowsIcon />
          </Button>
        </Col>
        <Col>
          <Stack gap={2}>
            <LanguageSelector value={toLanguage} type={SectionType.To} onChange={setToLanguage}/>
            <div style={{ position: 'relative' }}>
            <TextArea
             loading={loading}
              type={SectionType.To}
              value={result}
              onChange={setResult}
            />
             <div style={{ position: 'absolute', left: 0, bottom: 0, display: 'flex' }}>
             <Button
              ref={target}
              variant='link'
              onClick={handleClipboard}>
                <ClipboardIcon />
            </Button>
            <Overlay target={target.current} show={show} placement="bottom">
              {(props) => (
                <Tooltip id="overlay-example" {...props}>
                  Translation copied
                </Tooltip>
              )}
            </Overlay>
            <Button
              variant='link'
              onClick={handleSpeak}>
                <SpeakerIcon />
            </Button>
            </div>
            </div>
          </Stack>
        </Col>
      </Row>
    </Container>
  )
}

export default App
