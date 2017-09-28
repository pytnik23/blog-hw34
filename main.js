const body = document.querySelector('body');

class Article extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isFullSize: false,
            isEditing: false
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }

    handleClick() {
        this.setState({
            isFullSize: !this.state.isFullSize
        });
    }

    handleDelete() {
        this.props.onDelete(this.props.id);
    }

    handleEdit() {
        this.setState({ isEditing: true });
    }

    handleSave(article) {
        this.props.onEdit(article);
        this.setState({ isEditing: false });
    }

    render() {
        const {
            title,
            text,
            id
        } = this.props;
        const parcedText = new Remarkable();

        return (
            <article className={`card article ${this.state.isFullSize ||  this.state.isEditing ? 'article_full' : ''}`}>
                {this.state.isEditing ? (
                    <Form
                        isEditMode
                        onSubmit={this.handleSave}
                        title={title}
                        text={text}
                        articleId={id}
                    />
                ) : (
                    <div>
                        <h2>{title}</h2>
                        <div dangerouslySetInnerHTML={{ __html: parcedText.render(text) }} />
                    </div>

                )}
                <footer className="article__footer">
                    {!this.state.isEditing &&
                        <button
                            className="btn btn-primary"
                            style={{marginRight: 15}}
                            onClick={this.handleClick}
                            type="button"
                        >
                            {
                                this.state.isFullSize ? 'Read Less' : 'Read More'
                            }
                        </button>
                    }
                    {!this.state.isEditing &&
                        <button
                            type="button"
                            className="btn btn-warning"
                            onClick={this.handleEdit}
                        >
                            Edit
                        </button>
                    }
                    <button
                        type="button"
                        className="btn btn-danger float-right"
                        onClick={this.handleDelete}
                    >
                        Remove
                    </button>
                </footer>
            </article>
        );
    }
}

function Feed(props) {
    const filteredArticles = props.articles.filter((article) => {
        return article.title.indexOf(props.filterStr) !== -1 ||
            article.text.indexOf(props.filterStr) !== -1;
    });

    return (
        <div className="feed">
            {
                filteredArticles.map(article =>
                    <Article
                        key={article.id}
                        id={article.id}
                        title={article.title}
                        text={article.text}
                        onDelete={props.onDelete}
                        onEdit={props.onEdit}
                    />
                )
            }
        </div>
    );
}

class Form extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            title: props.title || '',
            text: props.text || '',
            isEditMode: props.isEditMode
        };

        this.handleSubmit  = this.handleSubmit.bind(this);
        this.handleChange  = this.handleChange.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        if (!this.state.title || !this.state.text) {
            return;
        }

        this.props.onSubmit({
            title: this.state.title,
            text: this.state.text,
            id: this.props.articleId
        });
        this.resetForm();
    }

    resetForm() {
        this.setState({
            title: '',
            text: ''
        });
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    render() {
        return (
            <form className="article-form" onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <input
                        name="title"
                        className="form-control"
                        type="text"
                        placeholder="Title"
                        value={this.state.title}
                        onChange={this.handleChange}
                    />
                </div>
                <div className="form-group">
                    <textarea
                        rows="5"
                        name="text"
                        className="form-control"
                        placeholder="Text"
                        value={this.state.text}
                        onChange={this.handleChange}
                    ></textarea>
                </div>
                <button className="btn btn-primary" type="submit">
                    {this.state.isEditMode ? 'Save' : 'Publish'}
                </button>
            </form>
        );
    }
}

class Search extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = { value: '' };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        const value = e.target.value;
        this.setState({ value });
        this.props.onSearch(value);
    }

    render() {
        return (
            <input
                className="form-control search"
                placeholder="Search..."
                type="search"
                value={this.state.value}
                onChange={this.handleChange}
            />
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            articles: [],
            filterStr: ''
        };

        this.addArticle = this.addArticle.bind(this);
        this.deleteArticle = this.deleteArticle.bind(this);
        this.editArticle = this.editArticle.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }

    addArticle(article) {
        this.setState({
            articles: [article, ...this.state.articles]
        });
    }

    deleteArticle(articleId) {
        this.setState({
            articles: this.state.articles.filter(article => article.id !== articleId)
        });
    }

    editArticle(editedArticle) {
        this.setState({
            articles: this.state.articles.map(article => {
                if (article.id === editedArticle.id) {
                    article = editedArticle;
                }
                return article;
            })
        });
    }

    handleSearch(str) {
        this.setState({
            filterStr: str
        });
    }

    saveToLocalStorage() {
        const articles = JSON.stringify(this.state.articles);
        localStorage.setItem('articles', articles);
    }

    componentDidMount() {
        const savedArticles = JSON.parse(localStorage.getItem('articles'));
        if (savedArticles) {
            this.setState({ articles: savedArticles });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.articles !== this.state.articles) {
            this.saveToLocalStorage();
        }
    }

    render() {
        return (
            <div className="container">
                <h1 className="text-center">Blog</h1>
                <Search onSearch={this.handleSearch} />
                <Form
                    onSubmit={this.addArticle}
                    articleId={this.state.articles.length}
                />
                <Feed
                    articles={this.state.articles}
                    filterStr={this.state.filterStr}
                    onDelete={this.deleteArticle}
                    onEdit={this.editArticle}
                />
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
