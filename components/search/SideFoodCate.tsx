const SideFoodCate = ({ categoryList, onCheckedItem }: any) => {
    return (
        <div className="flex flex-col">
            <h4 className="mb-4 text-sm text-mono80">음식 종류</h4>
            <div className="flex flex-col justify-center gap-y-3 ml-5">
                {categoryList.map((item: any) => {
                    return (
                        <label key={item.name}>
                            <input
                                type="checkbox"
                                id={item.name}
                                onChange={(e) => {
                                    onCheckedItem(
                                        e.target.checked,
                                        e.target.id
                                    );
                                }}
                            />
                            <label htmlFor={item.name} className="ml-2">
                                <span>
                                    {item.name.toString().replaceAll("&", "/")}
                                </span>
                            </label>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default SideFoodCate;
