import React, { useState, useEffect } from 'react';
import { GoCheckbox, GoTrash, GoPencil, GoReply } from "react-icons/go";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format } from 'date-fns';
import './App.css';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; 

function App() {

    //Edição
    const [currentEditId, setCurrentEditId] = useState(null);
    const [currentEditedItem, setCurrentEditedItem] = useState("");


    //Filtro
    const [searchTerm, setSearchTerm] = useState('');
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };


    function formatDate(date, formatString) {
        return format(date, formatString);
    }

    function createEventId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    //Criação de Tarefa 
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

    function TaskModal({ isOpen, onClose, onAddTask }) {
        const [newTitle, setNewTitle] = useState("");
        const [newDescription, setNewDescription] = useState("");
        const [newStart, setNewStart] = useState('');
        const [newEnd, setNewEnd] = useState('');
        const [newImportance, setNewImportance] = useState('');
        if (!isOpen) return null;

        const handleSubmit = () => {
            if (!newTitle || !newDescription || !newStart || !newEnd) {
                alert('Por favor, preencha todos os campos necessários.');
                return;
            }
            const newTask = {
                title: newTitle,
                description: newDescription,
                start: newStart,
                end: newEnd,
                importance: newImportance,
            };
            onAddTask(newTask);
            // Resetar os estados locais para limpar o formulário
            setNewTitle("");
            setNewDescription("");
            setNewStart("");
            setNewEnd("");
            setNewImportance("");
            onClose(); // Fechar o modal após adicionar a tarefa
        };
        return (
            <div className="modal">
                <div className="modal-content">
                    <span className="close" onClick={onClose}>&times;</span>
                    <div className='input'>
                        <div className='input-item'>
                            <label>Título</label>
                            <input type='text' value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Exemplo:Limpar a casa" />
                        </div>
                        <div className='input-item'>
                            <label>Descrição</label>
                            <input type='text' value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Forneça uma Descrição" />
                        </div>
                        <div className='input-item'>
                            <label>Início</label>
                            <input type='datetime-local' value={newStart} onChange={e => setNewStart(e.target.value)} />
                        </div>
                        <div className='input-item'>
                            <label>Final</label>
                            <input type='datetime-local' value={newEnd} onChange={e => setNewEnd(e.target.value)} />
                        </div>
                        <div className='input-item'>
                            <label>Importância</label>
                            <select value={newImportance} onChange={e => setNewImportance(e.target.value)}>
                                <option value="">Selecione a importância</option>
                                <option value="Baixa">Baixa</option>
                                <option value="Media">Média</option>
                                <option value="Alta">Alta</option>
                                <option value="Urgente">Urgente</option>
                            </select>
                        </div>
                        <button onClick={handleSubmit} className='addBtn'>Adicionar Tarefa</button>
                    </div>
                </div>
            </div>
        );
    }

    //Função de renderização personalizada para eventos com tooltips
    const renderEventContent = (eventInfo) => {
        const content = (
            <div>
                <b>{eventInfo.timeText}</b> - <i>{eventInfo.event.title}</i>
            </div>
        );

        // Envolve o conteúdo do evento com Tippy para mostrar a descrição ao passar o mouse
        return (
            <Tippy content={eventInfo.event.extendedProps.description}>
                <div>{content}</div>
            </Tippy>
        );
    };

    const [isCompleteScreen, setIsCompleteScreen] = useState(false);
    const [allTodos, setTodos] = useState([]);
    const [completedTodos, setCompletedTodos] = useState([]);
    
    const handleAddTodo = (newTask) => {
        const newTodoItem = {
            id: createEventId(),
            title: newTask.title,
            start: newTask.start,
            end: newTask.end,
            description: newTask.description,
            importance: newTask.importance,
            className: getClassNameByImportance(newTask.importance),
        };
        const updatedTodos = [...allTodos, newTodoItem];
        setTodos(updatedTodos);
        localStorage.setItem('todolist', JSON.stringify(updatedTodos));
    };

    const handleDeleteTodo = (id) => {
        const updatedTodos = allTodos.filter(todo => todo.id !== id);
        setTodos(updatedTodos);
        localStorage.setItem('todolist', JSON.stringify(updatedTodos));
    };

    const handleEditTodo = (id, item) => {
        setCurrentEditId(id);
        setCurrentEditedItem(item);
    };

    const handleUpdateTodo = () => {
        const updatedItem = {
            ...currentEditedItem,
            className: getClassNameByImportance(currentEditedItem.importance)
        };
        const updatedTodos = allTodos.map(todo =>
            todo.id === currentEditId ? updatedItem : todo
        );
        setTodos(updatedTodos);
        setCurrentEditId(null);
        localStorage.setItem('todolist', JSON.stringify(updatedTodos));
    };

    const handleCompleteTodo = (id) => {
        const now = new Date();
        const completedOn = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()} às ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        const filteredItem = { ...allTodos.find(todo => todo.id === id), completedOn };
        const updatedCompletedArr = [...completedTodos, filteredItem];
        setCompletedTodos(updatedCompletedArr);
        handleDeleteTodo(id);
        localStorage.setItem('completedTodos', JSON.stringify(updatedCompletedArr));
    };

    const handleReturnTodo = (id) => {
        // Encontra a tarefa concluída que precisa ser retornada.
        const returningTodo = completedTodos.find(todo => todo.id === id);

        const { completedOn, ...todoWithoutCompletion } = returningTodo;

        // Atualiza a lista de tarefas não concluídas (allTodos).
        const updatedTodos = [...allTodos, todoWithoutCompletion];
        setTodos(updatedTodos);

        // Remove a tarefa da lista de concluídas.
        const updatedCompletedTodos = completedTodos.filter(todo => todo.id !== id);
        setCompletedTodos(updatedCompletedTodos);

        // Atualiza o armazenamento local para ambas as listas.
        localStorage.setItem('todolist', JSON.stringify(updatedTodos));
        localStorage.setItem('completedTodos', JSON.stringify(updatedCompletedTodos));
    };

    const handleUpdateTitle = (value) => {
        setCurrentEditedItem(prev => ({ ...prev, title: value }));
    };

    const handleEventClick = (clickInfo) => {
        if (window.confirm(`Tem certeza de que deseja excluir o evento '${clickInfo.event.title}'`)) {
            const updatedTodos = allTodos.filter(todo => todo.id !== clickInfo.event.id);
            setTodos(updatedTodos);
            localStorage.setItem('todolist', JSON.stringify(updatedTodos));
        }
    };

    const handleDeleteCompletedTodo = (id) => {
        const updatedCompletedTodos = completedTodos.filter(todo => todo.id !== id);
        setCompletedTodos(updatedCompletedTodos);
        localStorage.setItem('completedTodos', JSON.stringify(updatedCompletedTodos));
    };


    const handleUpdateDescription = (value) => {
        setCurrentEditedItem(prev => ({ ...prev, description: value }));
    };

    const handleUpdateStartDate = (value) => {
        setCurrentEditedItem(prev => ({ ...prev, start: value }));
    };

    const handleUpdateEndDate = (value) => {
        setCurrentEditedItem(prev => ({ ...prev, end: value }));
    };

    const handleUpdateImportance = (value) => {
        setCurrentEditedItem(prev => ({ ...prev, importance: value }));
    };


    const getClassNameByImportance = (importance) => {
        switch (importance) {
            case 'Baixa':
                return 'low-importance';
            case 'Media':
                return 'medium-importance';
            case 'Alta':
                return 'high-importance';
            case 'Urgente':
                return 'urgent-importance';
            default:
                return ''; // Sem classe adicional se não houver importância definida
        }
    };

    useEffect(() => {
        const savedTodo = JSON.parse(localStorage.getItem('todolist'));
        const savedCompletedTodo = JSON.parse(localStorage.getItem('completedTodos'));
        if (savedTodo) {
            setTodos(savedTodo);
        }
        if (savedCompletedTodo) {
            setCompletedTodos(savedCompletedTodo);
        }
    }, []);

    return (
        <div className="app">
            <div className="todo">
                <h1>Tarefas</h1>
                <div className='wrapper'>
                    <div className='btn-option'>
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Buscar pelo titulo..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <button type='button' className={`actBtn ${!isCompleteScreen && 'active'}`} onClick={() => setIsCompleteScreen(false)}>
                            Fazer
                        </button>
                        <button type='button' className={`actBtn ${isCompleteScreen && 'active'}`} onClick={() => setIsCompleteScreen(true)}>
                            Completada
                        </button>
                    </div>
                    <div className="list">
                        {isCompleteScreen === false && allTodos.filter(item =>
                            item.title.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((item) => (
                            currentEditId === item.id ? (
                                <div className='edit__wrapper' key={item.id}>
                                    <input placeholder='Update Title' onChange={e => handleUpdateTitle(e.target.value)} value={currentEditedItem.title} />
                                    <textarea placeholder='Update Description' rows={4} onChange={e => handleUpdateDescription(e.target.value)} value={currentEditedItem.description} />
                                    <div className='input-item'>
                                        <label>Início</label>
                                        <input type='datetime-local' onChange={e => handleUpdateStartDate(e.target.value)} value={currentEditedItem.startDate} />
                                    </div>
                                    <div className='input-item'>
                                        <label>Final</label>
                                        <input type='datetime-local' onChange={e => handleUpdateEndDate(e.target.value)} value={currentEditedItem.endDate} />
                                    </div>
                                    <div className='input-item'>
                                        <label>Importância</label>
                                        <select onChange={e => handleUpdateImportance(e.target.value)} value={currentEditedItem.importance}>
                                            <option value="">Selecione a importância</option>
                                            <option value="Baixa">Baixa</option>
                                            <option value="Media">Média</option>
                                            <option value="Alta">Alta</option>
                                            <option value="Urgente">Urgente</option>
                                        </select>
                                    </div>
                                    <button type='button' onClick={handleUpdateTodo} className='addBtn'>Atualizar</button>
                                </div>
                            ) : (
                                <div className='list-item' key={item.id}>
                                    <div>
                                        <h3>{item.title}</h3>
                                        <p>Descrição: {item.description}</p>
                                        <p>Início: {formatDate(item.start, 'yyyy-MM-dd HH:mm')}</p>
                                        <p>Termino: {formatDate(item.end, 'yyyy-MM-dd HH:mm')}</p>
                                        <p>Importância : {item.importance}</p>
                                    </div>
                                    <div>
                                        <GoCheckbox className='icon-button checkIcon' onClick={() => handleCompleteTodo(item.id)} />
                                        <GoTrash className='icon-button deleteIcon' onClick={() => handleDeleteTodo(item.id)} />
                                        <GoPencil className='icon-button editIcon' onClick={() => handleEditTodo(item.id, item)} />
                                    </div>
                                </div>
                            )
                        ))}
                        {isCompleteScreen === true && completedTodos.filter(item =>
                            item.title.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((item) => (
                            <div className='list-item' key={item.id}>
                                <div>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                    <p><small>Completada: {item.completedOn}</small></p>
                                </div>
                                <div>
                                    <GoReply className='icon-button checkIcon' onClick={() => handleReturnTodo(item.id)} />
                                    <GoTrash className='icon-button deleteIcon' onClick={() => handleDeleteCompletedTodo(item.id)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            <button onClick={() => setIsAddTaskModalOpen(true)} className="add-task-button">Adicionar Tarefa</button>

            <TaskModal
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
                onAddTask={handleAddTodo}
            />

            <div className="calendar">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    initialView='timeGridWeek'
                    editable={false}
                    events={allTodos}
                    selectable={false}
                    selectMirror={true}
                    dayMaxEvents={true}
                    eventContent={renderEventContent}
                    eventClick={handleEventClick}
                    views={{
                        dayGridMonth: { eventContent: renderEventContent },
                        timeGridWeek: { eventContent: renderEventContent },
                        timeGridDay: { eventContent: renderEventContent }
                    }}
                />
            </div>
        </div>
    );
}

export default App;
