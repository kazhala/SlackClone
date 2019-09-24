
const useStateWithCallBack = (initialState, callback) => {
    const [state, setState] = useState(initialState);
    useEffect(() => callback(state), [state, callback]);
    return [state, setState];
}

export default useStateWithCallBack;