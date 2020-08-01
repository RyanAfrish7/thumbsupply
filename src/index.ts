import { VideoThumbFactory } from "./factory/video";
import { ThumbSupplier } from "./thumb-supplier";

const thumbSupply = new ThumbSupplier();
thumbSupply.registerFactory(new VideoThumbFactory());

export * from "./thumb-supplier";
export * from "./thumb-factory";
export * from "./thumb-size";

export * from "./factory/video";

export default thumbSupply;
