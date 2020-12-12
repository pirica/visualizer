const exist = async (path) => {
    try {
        let status = 0;

        await $.ajax({
            url: path
        }).catch((e) => {
            status = e.status;
        });
    
        return status === 0;
    } catch(e) {
        console.log(e)
    }
};

const Fetch = fetch;

class ErrorHandler {
    constructor(handler) {
        this.handler = handler;
        fetch = async (...args) => {
            try {
                const response = await Fetch(...args).catch(this.handler);

                if(!response.ok) return this.handler(response);

                return response;
            } catch(err) {
                return this.handler(err);
            }
        }
    }
}