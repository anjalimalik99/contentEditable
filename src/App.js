import './App.css';
import React, { useRef, useState } from 'react';

function App() {
  const contentEditableRef = useRef()
 const _enterButtonRef = useRef()
  const pasteHtmlAtCaret = (html) => {
		let range;
		const parser = new DOMParser();
		// Parse the html string into a document
		const el = parser.parseFromString(html, "text/html").body;
		if (window.getSelection) {
			// IE9 and non-IE
			const sel = window.getSelection();
			if (sel.getRangeAt && sel.rangeCount) {
				range = sel.getRangeAt(0);
				range.deleteContents();

				const frag = document.createDocumentFragment();
				let node, lastNode;
				while ((node = el.firstChild)) {
					lastNode = frag.appendChild(node);
				}
				range.insertNode(frag);

				// Preserve the selection
				if (lastNode) {
					range = range.cloneRange();
					range.setStartAfter(lastNode);
					range.collapse(true);
					sel.removeAllRanges();
					sel.addRange(range);
				}
			}
		}
	};
  const setCaretAtRightPosition = (tagIndex) => {
		const range = document.createRange();
		const selection = window.getSelection();
		const childIndex = tagIndex && tagIndex > 0 ? tagIndex - 1 : tagIndex;
		const contentEditableDiv = contentEditableRef.current;

		if (contentEditableDiv) {
			if (tagIndex === 0 && contentEditableDiv.childNodes[0]) {
				range.setStart(contentEditableDiv.childNodes[0], 0);
				range.collapse(true);
			} else if ((childIndex === 0 || childIndex) && contentEditableDiv.childNodes[childIndex]) {
				range.selectNode(contentEditableDiv.childNodes[childIndex]);
				range.collapse(false);
			} else {
				range.selectNodeContents(contentEditableDiv);
				range.collapse(false);
			}

			selection.removeAllRanges();
			selection.addRange(range);
		}
	};

  const onContentEditableDivFocus = (e) => {
		if (e.target.classList.contains("contentEditable")) {
			const contentEditableDiv = contentEditableRef.current;
			if (contentEditableDiv) {
				setCaretAtRightPosition();
			}
	}; 
}

const onInputBlur = () => {
  if (contentEditableRef.current) {
    contentEditableRef.current.contentEditable = "true";
  }
};

const onInput = (e) => {
    const valueInput = e.target ;
    valueInput.setAttribute("size", `${valueInput.innerText.length}`);
    valueInput.setAttribute("value", valueInput.value);  
};

const onInputPaste = (e) => {
  const paste = (e.clipboardData || (window).clipboardData).getData("text");
  const input = e.target;
    // Get the current text in the input field
    const text = input.value;
    e.target.setAttribute("size", text.length);
    pasteHtmlAtCaret(paste)
};

const onInputFocus = () => {
  if (contentEditableRef.current) {
    contentEditableRef.current.contentEditable = "false";
  }
};

const getCurrentFormNodeIndex = (tag) => {
  const arr = contentEditableRef.current?.childNodes;
  let tagIndex = null;
  if (tag) {
    console.log({arr})
    arr?.forEach((node, index) => {
      if (node.isSameNode(tag)) {
        tagIndex = index;
      }
    });
  }

  return tagIndex;
};

const onEnterValueButtonClick = (
  e,
  html,
  offset
) => {
  e.preventDefault();
  if (e.target && contentEditableRef.current) {
    const parentNode = (e.target).parentNode ;
    const formIndex = getCurrentFormNodeIndex(parentNode);
    contentEditableRef.current.contentEditable = "true";
  
    removeEnterButton();
    contentEditableRef.current?.focus();

    if (formIndex || formIndex === 0) setCaretAtRightPosition(formIndex + (offset ?? 1));

      pasteHtmlAtCaret(html ?? ",&nbsp");
  }
};

const _onInputKeyDown = (event) => {
  const { key } = event;
  const target = event.target ;
  const tag = (window ).getSelection().anchorNode;
  switch (key) {
    case "ArrowRight":
      if (target.selectionStart === target.value.length && tag) {
        target.blur();
        contentEditableRef.current?.focus();
        const tagIndex = (getCurrentFormNodeIndex(tag) ?? 0) + 1;
        setCaretAtRightPosition(tagIndex);
      }

      break;
    case "ArrowLeft":
      if (target.selectionStart === 0 && tag) {
        target.blur();
        contentEditableRef.current?.focus();
        const tagIndex = getCurrentFormNodeIndex(tag);
        setCaretAtRightPosition(tagIndex);
      }

      break;
  
    default: {
      break;
    }
  }
};

const onTagClick=(e)=>{
  contentEditableRef.current.focus()
    const val =  e.target;
    const form = document.createElement("form");
    const span = document.createElement("span");
    span.contentEditable=false;
    span.innerText= `${val.textContent}:`;
    form.appendChild(span);
    const valueInput = document.createElement("input");
		valueInput.className = "tag-value";
		valueInput.setAttribute("size", "1");
		valueInput.type = "text";
		valueInput.setAttribute("tabIndex", "-1");
		valueInput.contentEditable = "true";
		valueInput.setAttribute("value", "");
		valueInput.setAttribute("key", form.childNodes[0].textContent ?? "");
		valueInput.addEventListener("input", onInput);
		valueInput.addEventListener("blur", onInputBlur);
		valueInput.addEventListener("focus", onInputFocus);
		valueInput.addEventListener("paste", onInputPaste);
		valueInput.addEventListener("keydown", _onInputKeyDown);
    form.addEventListener("click",()=>{valueInput.focus()})
		form.appendChild(valueInput);
    const enterButton = document.createElement("button");
		enterButton.textContent = "Enter";
		enterButton.className = "enter-value-btn";
		_enterButtonRef.current = enterButton;
		enterButton.addEventListener("click", (e) => {
			onEnterValueButtonClick(e);
		});
		enterButton.type = "submit";
		enterButton.contentEditable = "false";
    form.append(enterButton);
    contentEditableRef.current.append(form);
    valueInput.focus();
}
const removeEnterButton = () => {
  const enterValueButton = _enterButtonRef.current;
  if (enterValueButton) {
    enterValueButton?.remove();
    if (_enterButtonRef.current) _enterButtonRef.current = null;
  }
};

const onBackSpacePress = (e) => {
  const sel = (window).getSelection();
  const anchorNode = sel.anchorNode;
  const prev = sel.anchorNode.previousSibling;
  const tag = sel.focusOffset===1 && prev && prev.tagName==="FORM" ? prev.tagName : anchorNode
  if ( tag && tag.tagName === "FORM") {
   // e.preventDefault()
    const [, inputField] = tag.childNodes;

    if (contentEditableRef.current?.contentEditable === "true") {
      if (contentEditableRef.current) {
        contentEditableRef.current.contentEditable = "false";
      }
      if (inputField) {
        inputField.focus();
      } else if (contentEditableRef.current) {
        contentEditableRef.current.contentEditable = "true";
      }
    }

    if (inputField && inputField.value.length === 0) {
      if (contentEditableRef.current) {
        contentEditableRef.current.contentEditable = "true";
        contentEditableRef.current.focus();
        const tagIndex = getCurrentFormNodeIndex(tag);
        setCaretAtRightPosition(tagIndex);
        tag.remove();
      }
    } else if (!inputField) {
      tag.remove();
    }
  }
};

const onKeyDown=(e)=>{
  
  const {key}= e
  switch(key){
    case "Backspace":
				onBackSpacePress(e);
				break;

  case "Enter":
				{
					const tag = (window ).getSelection().anchorNode;

				if (tag && tag.tagName === "FORM") {
          onEnterValueButtonClick(e,"\u200B",2)
        } 
				}
				break;
      }
}

const onPasteHTMLClick =()=>{
  const div = document.createElement("div");
  const span = document.createElement("span")
  span.innerHTML="Pasted";
  span.className="pasted";
  div.appendChild(span)
  span.contentEditable=false;
  pasteHtmlAtCaret(div.outerHTML+"\u200B")
  contentEditableRef.current.focus()
}

const moveCaretToEnd =()=>{
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(contentEditableRef.current);
  range.collapse(false)
  sel.removeAllRanges();
  sel.addRange(range)
}

const moveCaretToSpecificIndex=()=>{
  const sel = window.getSelection();
  const range = document.createRange();
  range.setStart(contentEditableRef.current.childNodes[2],4);
  range.setEnd(contentEditableRef.current.childNodes[2],6);
  range.collapse(false)
  sel.removeAllRanges();
  sel.addRange(range)
  contentEditableRef.current.focus()
}

const selectNode =()=>{
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNode(contentEditableRef.current.childNodes[0]);
  range.collapse(true)
  // range.collapse(false)
  sel.removeAllRanges();
  sel.addRange(range)
}

const selectRange =()=>{
  const sel = window.getSelection();
  const range = document.createRange();
  range.setStart(contentEditableRef.current.childNodes[0],2);
  range.setEnd(contentEditableRef.current.childNodes[0], 5)
  // range.collapse(true)
  //range.collapse(false)
  sel.removeAllRanges();
  sel.addRange(range)
}

  return (
    <div className="App">
      <label>ContentEditable Input</label>
        <div 
        ref={contentEditableRef} 
        placeholder='Enter text here' 
        className='contentEditable' 
        contentEditable={true}
       // onFocus={onContentEditableDivFocus}
        onKeyDown={onKeyDown}
        ></div>
        <div className='btns'>
        {Array.from({length:4}).map((_,index)=>{
             return  <button onClick={onTagClick}>Tag {index+1}</button>
        })}
        <br/>
        <button onClick={onPasteHTMLClick}> Paste content at current caret </button>
        <button onClick={moveCaretToEnd}> Move caret to end </button>
        <button onClick={moveCaretToSpecificIndex}> Move caret to index 4 of node 3 </button>
        <button onClick={selectNode}> Select Node </button>
        <button onClick={selectRange}> Select Range in node </button>
       </div>
    </div>
  );
}

export default App;
