import React, { useState } from "react";
import "./App.css";

const products = [
    { image: "/art_basic.jpg", title: "Essential Art Supplies", description: "Everything you need to begin your next creative project." },
    { image: "/mona_lisa.jpg", title: "Paintings Collection", description: "Discover beautiful paintings for inspiration and display." },
    { image: "/art.jpg", title: "Professional Supplies", description: "Upgrade your toolkit with professional-grade materials." }
];

const startingTasks = [
    { id: 1, title: "Buy oil paint starter pack", completed: false },
    { id: 2, title: "Sketch portrait outline on canvas", completed: true },
    { id: 3, title: "Clean acrylic brushes with solvent", completed: false }
];
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Header({ theme, onToggleTheme }) {
    return (
        <>
            <header className="store-header">
                <h1>Online Art Supplies Store</h1>
                <button className="theme-button" onClick={onToggleTheme}>
                    {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
                </button>
            </header>
            <nav className="store-nav">
                <a href="#home">HOME</a>
                <a href="#shop">SHOP</a>
                <a href="#planner">PLANNER</a>
                <a href="/signup.html">SIGN UP</a>
                <a href="#contact">CONTACT</a>
            </nav>
        </>
    );
}

function ProductCard({ product }) {
    return (
        <article className="product-card">
            <img src={product.image} alt={product.title} />
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <button type="button">Read More</button>
        </article>
    );
}

function TaskList({ tasks, onToggle, onDelete }) {
    return (
        <ul className="task-list">
            {tasks.length === 0 ? (
                <li className="empty-message">No tasks found in this view.</li>
            ) : tasks.map(task => (
                <li key={task.id} className={`task-row ${task.completed ? "completed" : ""}`}>
                    <label className="task-label">
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => onToggle(task.id)}
                        />
                        <span>{task.title}</span>
                    </label>
                    <button
                        type="button"
                        className="delete-task"
                        onClick={() => onDelete(task.id)}
                        aria-label={`Delete ${task.title}`}
                    >
                        ×
                    </button>
                </li>
            ))}
        </ul>
    );
}

export default function App() {
    const [theme, setTheme] = useState("light");
    const [signedUpUser] = useState(() => localStorage.getItem("signedUpUser") || "");
    const [tasks, setTasks] = useState(startingTasks);
    const [taskInput, setTaskInput] = useState("");
    const [filter, setFilter] = useState("all");
    const [contactMessage, setContactMessage] = useState("");

    React.useEffect(() => {
        fetch(`${apiUrl}/api/tasks`)
            .then(response => response.json())
            .then(result => {
                if (result.success && result.data.length > 0) setTasks(result.data);
            })
            .catch(error => console.error("Could not load tasks:", error));
    }, []);

    const visibleTasks = tasks.filter(task =>
        filter === "open" ? !task.completed :
            filter === "finished" ? task.completed : true
    );

    const addTask = event => {
        event.preventDefault();
        const title = taskInput.trim();
        if (!title) return;
        const newTask = { id: Date.now(), title, completed: false };
        setTasks(previous => [...previous, newTask]);
        fetch(`${apiUrl}/api/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title })
        }).catch(error => console.error("Could not save task:", error));
        setTaskInput("");
    };

    const toggleTask = id => {
        setTasks(previous => previous.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
        const task = tasks.find(item => item.id === id);
        if (task) {
            fetch(`${apiUrl}/api/tasks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: !task.completed })
            }).catch(error => console.error("Could not update task:", error));
        }
    };

    const deleteTask = id => {
        setTasks(previous => previous.filter(task => task.id !== id));
        fetch(`${apiUrl}/api/tasks/${id}`, { method: "DELETE" })
            .catch(error => console.error("Could not delete task:", error));
    };

    const submitContact = event => {
        event.preventDefault();
        const formElement = event.currentTarget;
        const form = new FormData(formElement);
        fetch(`${apiUrl}/api/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: form.get("name"),
                email: form.get("email")
            })
        })
            .then(response => response.json().then(result => ({ response, result })))
            .then(({ response, result }) => {
                if (!response.ok) throw new Error(result.message || "Could not save contact details.");
                setContactMessage(result.message);
                formElement.reset();
            })
            .catch(error => setContactMessage(error.message));
    };

    return (
        <div className={`store-app ${theme}`} id="home">
            <Header
                theme={theme}
                onToggleTheme={() => setTheme(previous => previous === "light" ? "dark" : "light")}
            />
            <section className="hero">
                <h2>Welcome to Our Art Supplies Store</h2>
                <p>
                    {signedUpUser
                        ? `Welcome, ${signedUpUser}! Your artist account is ready.`
                        : "Discover high-quality art supplies for all your creative needs."}
                </p>
            </section>

            <main className="store-layout">
                <aside className="category-sidebar">
                    <h3>Categories</h3>
                    <ul>
                        <li>Acrylic Paints</li>
                        <li>Oil Paints</li>
                        <li>Watercolors</li>
                        <li>Pencils</li>
                        <li>Sketching Tools</li>
                        <li>Brushes</li>
                    </ul>
                </aside>

                <div className="store-content">
                    <section id="shop">
                        <div className="section-title">
                            <div>
                                <p className="label">Explore our collection</p>
                                <h2>Art Supplies</h2>
                            </div>
                            <span className="product-count">{products.length} collections</span>
                        </div>
                        <div className="product-grid">
                            {products.map(product => <ProductCard key={product.title} product={product} />)}
                        </div>
                    </section>

                    <section className="planner-card" id="planner">
                        <div className="section-title">
                            <div>
                                <p className="label">React interactive feature</p>
                                <h2>Art Project Planner</h2>
                            </div>
                            <strong>{tasks.filter(task => !task.completed).length} tasks left</strong>
                        </div>
                        <form className="task-form" onSubmit={addTask}>
                            <input
                                value={taskInput}
                                onChange={event => setTaskInput(event.target.value)}
                                placeholder="Add an art supply or project task..."
                                aria-label="New art task"
                            />
                            <button type="submit">Add Task</button>
                        </form>
                        <div className="filter-bar">
                            {["all", "open", "finished"].map(option => (
                                <button
                                    type="button"
                                    key={option}
                                    className={filter === option ? "active" : ""}
                                    onClick={() => setFilter(option)}
                                >
                                    {option[0].toUpperCase() + option.slice(1)}
                                </button>
                            ))}
                        </div>
                        <TaskList tasks={visibleTasks} onToggle={toggleTask} onDelete={deleteTask} />
                    </section>

                    <section className="contact-card" id="contact">
                        <h2>Contact Us</h2>
                        <p>Have a question about our art supplies?</p>
                        <form onSubmit={submitContact}>
                            <input name="name" type="text" placeholder="Enter your name" required />
                            <input name="email" type="email" placeholder="Enter your email" required />
                            <button type="submit">Submit</button>
                        </form>
                        <p className="contact-message" role="status">{contactMessage}</p>
                    </section>
                </div>
            </main>
            <footer>Follow us for creating timeless paintings... <span>© 2026 Online Art Supplies Store</span></footer>
        </div>
    );
}
