import { IFormContext, WebApiService } from "coveo-xrm";
import { IEntity } from "coveo-xrm/bin/js/src/data/entity/EntityWrapper";
import { IRecord } from "../../../core/IRecord";
import { AsyncContextObject } from "../../../utils/Liquid/AsyncContextObject";
import { IContextObjects } from "../../../utils/Liquid/ContextObjects";
import { UUID } from "../../../utils/UUID";

const logicalCollectionName = "LogicalCollectionName";

export class FormContextHandlerImpl {
  private context: IFormContext;
  private innerFormContextHandler: IInnerFormContextHandler;

  public constructor(private contextObjects: IContextObjects) {}

  public setFormContext(context: IFormContext) {
    this.context = context;

    if (context && context.data && context.data.entity) {
      this.innerFormContextHandler = new EntityInnerFormContextHandler(
        context.data.entity
      );
    } else {
      this.innerFormContextHandler = null;
    }
  }

  public setAsyncFormContext(record: IRecord, entityName: string, id: string) {
    this.innerFormContextHandler = new ConstantInnerFormContextHandler(
      id,
      entityName
    );

    if (this.contextObjects) {
      this.contextObjects.register("form", new AsyncContextObject(record, id));
      this.contextObjects.register(
        "record",
        new AsyncContextObject(record, id)
      );
    }
  }

  get isContextDefined(): boolean {
    return !!this.innerFormContextHandler;
  }

  get controls(): Xrm.Controls.Control[] {
    return this.context
      ? this.context.getControl<Xrm.Controls.Control[]>(undefined) || []
      : [];
  }

  get entityName(): string {
    return this.innerFormContextHandler
      ? this.innerFormContextHandler.getEntityName()
      : undefined;
  }

  get recordId(): UUID {
    return this.innerFormContextHandler
      ? this.innerFormContextHandler.getRecordId()
      : undefined;
  }

  getCurrentEntitySetName(webApi: WebApiService): Promise<string> {
    return this.getEntitySetName(webApi, this.entityName);
  }

  getEntitySetName(
    webApi: WebApiService,
    entityLogicalName: string
  ): Promise<string> {
    return webApi
      .init()
      .resource(`EntityDefinitions(LogicalName='${entityLogicalName}')`)
      .select([logicalCollectionName])
      .get()
      .build()
      .then((response) => response[logicalCollectionName]);
  }
}

interface IInnerFormContextHandler {
  getRecordId(): UUID;
  getEntityName(): string;
}

class EntityInnerFormContextHandler implements IInnerFormContextHandler {
  constructor(private entity: IEntity) {}

  getRecordId(): UUID {
    return new UUID(this.entity.getId());
  }
  getEntityName(): string {
    return this.entity.getEntityName();
  }
}

class ConstantInnerFormContextHandler implements IInnerFormContextHandler {
  constructor(private recordId: string, private entityName: string) {}

  getRecordId(): UUID {
    return new UUID(this.recordId);
  }
  getEntityName(): string {
    return this.entityName;
  }
}
