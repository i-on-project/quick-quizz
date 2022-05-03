export const goFetch = (address, submitData, setData, setError) => {

    fetch(address, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `This is an HTTP error: The status is ${response.status}`
                );
            }
            return response.json();
        })
        .then((actualData) => {
            setData(actualData)
            setError(null)
        })
        .catch((err) => {
            setError(err.message)
            setData(null)
        })
        .finally(() => {
            // setLoading(false);
        });
};
