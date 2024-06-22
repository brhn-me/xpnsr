import React from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';

const Pager = ({navs}) => {
    const navigate = useNavigate();

    const getPageNumber = (url) => {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        return urlParams.get('page');
    };

    const handleNavigation = (url) => {
        const pageNumber = parseInt(getPageNumber(url)) + 1;

        if (pageNumber !== null) {
            navigate(`?page=${pageNumber}`);
        }
    };

    return (
        <ButtonGroup size="sm">
            <Button
                variant="outline-dark"
                disabled={!navs?.first || !navs?.prev}
                onClick={() => handleNavigation(navs.first.href)}
            >
                {'<<'} First
            </Button>
            <Button
                variant="outline-dark"
                disabled={!navs?.prev}
                onClick={() => handleNavigation(navs.prev.href)}
            >
                {'<'} Prev
            </Button>
            <Button
                variant="outline-dark"
                disabled={!navs?.next}
                onClick={() => handleNavigation(navs.next.href)}
            >
                Next {'>'}
            </Button>
            <Button
                variant="outline-dark"
                disabled={!navs?.last || !navs?.next}
                onClick={() => handleNavigation(navs.last.href)}
            >
                Last {'>>'}
            </Button>
        </ButtonGroup>
    );
};

export default Pager;
