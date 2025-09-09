#include <node.h>
#include "nan.h"

using namespace v8;

extern "C" TSLanguage * tree_sitter_bend();

namespace {

NAN_METHOD(New) {}

void Init(Local<Object> exports, Local<Object> module) {
  Local<FunctionTemplate> tpl = Nan::New<FunctionTemplate>(New);
  tpl->SetClassName(Nan::New("Language").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  Local<Function> constructor = Nan::GetFunction(tpl).ToLocalChecked();
  Local<Object> instance = constructor->NewInstance(Nan::GetCurrentContext()).ToLocalChecked();
  Nan::SetInternalFieldPointer(instance, 0, tree_sitter_bend());

  Nan::Set(instance, Nan::New("name").ToLocalChecked(), Nan::New("bend").ToLocalChecked());
  Nan::Set(exports, Nan::New("name").ToLocalChecked(), Nan::New("bend").ToLocalChecked());
  Nan::Set(exports, Nan::New("tree_sitter_bend").ToLocalChecked(), instance);
}

NODE_MODULE(tree_sitter_bend_binding, Init)

}  // namespace