export const SEMESTER={
    name: '2021-2022 第二学期',
    id: '2021-2022 sem2', // checked before importing
    begin_date: new Date(2021,2-1,21, 0,0,0,0),
    weeks: 16,
    exclude_dates: [
        new Date(2021,5-1,1, 0,0,0,0), // 五一
        new Date(2021,5-1,2, 0,0,0,0),
        new Date(2021,5-1,3, 0,0,0,0),
        new Date(2021,5-1,4, 0,0,0,0),
        new Date(2021,5-1,5, 0,0,0,0),
        new Date(2021,5-1,6, 0,0,0,0),
    ]
};

export const DATA_VER='data_v3';
