import {useState, useEffect, useCallback} from 'react';

const useFetchData = (fetchFunction, dependencies = []) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [navs, setNavs] = useState(null);
    const [page, setPage] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchFunction();
            setData(result.items);
            setNavs(result._links);
            setPage(result.page);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [fetchFunction]);

    useEffect(() => {
        fetchData();
    }, [fetchData, ...dependencies]);

    return {data, loading, error, navs, page, reload: fetchData};
};

export default useFetchData;

