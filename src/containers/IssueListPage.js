import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import IssueList from '../components/IssueList';
import { getIssues, getRepoDetails } from '../redux/actions';
import Paginate from 'react-paginate';
import './IssueListPage.css';

function Header({ openIssuesCount, org, repo }) {
  if(openIssuesCount === -1) {
    return (
      <h1>
        Open issues for <OrgRepo org={org} repo={repo}/>
      </h1>
    );
  } else {
    const pluralizedIssue = openIssuesCount === 1 ? 'issue' : 'issues';
    return (
      <h1>
        <span className="header__openIssues">{openIssuesCount}</span> open {pluralizedIssue} for <OrgRepo org={org} repo={repo}/>
      </h1>
    );
  }
}

function OrgRepo({ org, repo }) {
  return (
    <span>
      <span className="header__org">{org}</span>
      {' / '}
      <span className="header__repo">{repo}</span>
    </span>
  )
}

export class IssueListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      issues: [],
      pageLinks: {}
    };
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  componentDidMount() {
    const {getIssues, getRepoDetails, org, repo} = this.props;
    
    const currentPage = Math.max(1,
      (parseInt(this.props.location.query.page, 10) || 1)
    );
    
    getRepoDetails(org, repo);
    getIssues(org, repo, currentPage);
  }

  handlePageChange = ({ selected }) => {
    const {getIssues, org, repo} = this.props;
    const newPage = selected + 1;

    getIssues(org, repo, newPage);
    this.context.router.push({
      query: { page: newPage }
    });
  }

  render() {
    const {org, repo, isLoading, issues, pageCount, openIssuesCount} = this.props;
    const currentPage = Math.min(
        pageCount,
        Math.max(1,
          (parseInt(this.props.location.query.page, 10) || 1)
    )) - 1;

    return (
      <div id="issue-list-page">
        <Header openIssuesCount={openIssuesCount} org={org} repo={repo}/>
        {isLoading
          ? <span>Loading...</span>
          : <IssueList issues={issues}/>
        }
        <div className="issues__pagination">
          <Paginate
            forcePage={currentPage}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={this.handlePageChange} />
        </div>
      </div>
    );
  }
}

IssueListPage.propTypes = {
  org: PropTypes.string.isRequired,
  repo: PropTypes.string.isRequired,
  issues: PropTypes.array.isRequired,
  openIssuesCount: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  pageCount: PropTypes.number.isRequired
};

IssueListPage.defaultProps = {
  org: "rails",
  repo: "rails"
};

const selectIssues = issues => 
  issues.currentPageIssues.map(number => issues.issuesByNumber[number]);

const mapStateToProps = ({ issues, repo }) => ({
  issues: selectIssues(issues),
  openIssuesCount: repo.openIssuesCount,
  isLoading: issues.isLoading,
  pageCount: issues.pageCount
});

const mapDispatch = { getIssues, getRepoDetails };

export default connect(mapStateToProps, mapDispatch)(IssueListPage);
