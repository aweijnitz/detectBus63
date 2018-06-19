// single axis for 1D hist
exports.getHistAxis = channel => ([
    {
        channel,
        bins: 3,
        ranges: [0, 256]
    }
]);

